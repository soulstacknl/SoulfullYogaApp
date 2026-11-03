// Supabase ↔ app data. Loads every table the signed-in user may read and maps it
// to ScheduleData (lib/schedule.ts), so the pure rules and screens stay unchanged.
//
// People are keyed by e-mail in the app. Customers only see their own profile, so
// other customers' rows (needed to count free spots) are keyed by their user id.
import type { ClassStyle } from '@/constants/theme';
import type { AppUser, CustomerOrigin, UserRole } from '@/data/users';
import type { Session } from '@/data/schedule';
import type { Attendee, Charge, Closure, Confirmation, ScheduleData } from '@/lib/schedule';
import { lessonKey } from '@/lib/schedule';
import { supabase } from '@/lib/supabase';

type Row = Record<string, any>;

export type Snapshot = { users: AppUser[]; data: ScheduleData };

// "19:00:00" → "19.00"
const dotTime = (t: string) => t.slice(0, 5).replace(':', '.');
// "19.00" → "19:00"
const colonTime = (t: string) => t.replace('.', ':');
// "2026-10-31" ↔ "31-10-2026" (how the app shows the terms date)
const toDutchDate = (iso: string | null) => (iso ? iso.split('-').reverse().join('-') : null);
const toIsoDate = (dutch: string | null) => (dutch ? dutch.split('-').reverse().join('-') : null);

async function rows(table: string): Promise<Row[]> {
  const { data, error } = await supabase.from(table).select('*');
  // Guests and customers may not read every table; that simply means no rows.
  if (error) return [];
  return data ?? [];
}

export async function loadSnapshot(): Promise<Snapshot> {
  const [profiles, sessions, enrollments, bookings, requests, cancels, closures, caps, roster, drafts, confirmations, records] =
    await Promise.all(
      ['profiles', 'sessions', 'enrollments', 'bookings', 'requests', 'cancellations', 'closures', 'capacity_overrides',
        'roster_entries', 'attendance_drafts', 'confirmations', 'attendance_records'].map(rows)
    );

  // Sorted by name: the database returns rows in a different order after each change.
  const users: AppUser[] = profiles.map((p) => ({
    id: p.id,
    email: p.email,
    name: p.name,
    phone: p.phone,
    strippen: p.strippen,
    total: p.total,
    role: p.role as UserRole,
    termsAcceptedAt: toDutchDate(p.terms_accepted_at),
    origin: (p.origin ?? 'aanvraag') as CustomerOrigin,
  })).sort((a, b) => a.name.localeCompare(b.name, 'nl'));
  const emailById = new Map(users.map((u) => [u.id, u.email]));
  const key = (userId: string) => emailById.get(userId) ?? userId;
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  const data: ScheduleData = {
    sessions: sessions.map(
      (s): Session => ({
        id: s.id,
        day: s.day,
        style: s.style as ClassStyle,
        time: `${dotTime(s.start_time)} – ${dotTime(s.end_time)}`,
        capacity: s.capacity,
        from: s.from_date,
        until: s.until_date,
      })
    ),
    roster: {},
    enrollments: enrollments.map((e) => ({ id: e.id, sessionId: e.session_id, email: key(e.user_id), start: e.start_date, weeks: e.weeks })),
    bookings: bookings.map((b) => ({ sessionId: b.session_id, date: b.date, email: key(b.user_id) })),
    requests: requests
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((r) => ({ id: r.id, sessionId: r.session_id, date: r.date, email: key(r.user_id), name: nameById.get(r.user_id) ?? '' })),
    cancels: cancels.map((c) => ({
      sessionId: c.session_id, date: c.date, email: key(c.user_id), by: c.cancelled_by, late: c.late, charged: c.charged,
    })),
    closures: closures.map((c): Closure => ({ id: c.id, from: c.from_date, to: c.to_date, sessionId: c.session_id, reason: c.reason })),
    capOverride: Object.fromEntries(caps.map((c) => [lessonKey(c.session_id, c.date), c.capacity])),
    checkins: {},
    extras: {},
    confirmed: {},
  };

  for (const e of roster) (data.roster[e.session_id] ??= []).push({ id: e.id, name: e.name, strips: e.strips });

  // Attendance ids: an app customer's user id becomes their key; roster and walk-in ids stay.
  const attendeeKey = (id: string, usesApp: boolean | null) => (usesApp !== false ? key(id) : id);
  for (const d of drafts) {
    const k = lessonKey(d.session_id, d.date);
    const id = d.added ? attendeeKey(d.attendee_id, d.uses_app) : key(d.attendee_id);
    (data.checkins[k] ??= {})[id] = d.present;
    if (d.added) (data.extras[k] ??= []).push({ id, name: d.name ?? '', usesApp: !!d.uses_app, walkIn: d.walk_in || undefined });
  }

  for (const c of confirmations) {
    data.confirmed[lessonKey(c.session_id, c.date)] = {
      at: new Date(c.confirmed_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      people: [],
    };
  }
  for (const r of records) {
    const confirmation = data.confirmed[lessonKey(r.session_id, r.date)];
    confirmation?.people.push({
      id: r.user_id ? key(r.user_id) : r.attendee_id,
      name: r.name,
      usesApp: r.uses_app,
      walkIn: r.walk_in || undefined,
      planned: r.planned,
      present: r.present,
      charge: r.charge as Charge | null,
    });
  }

  return { users, data };
}

/* ── Writes ─────────────────────────────────────────────────────────────── */
// Each throws on failure; DataContext reloads afterwards either way.

async function check<T extends { error: { message: string } | null }>(query: PromiseLike<T>) {
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export const remote = {
  requestLesson: (sessionId: string, date: string, userId: string) =>
    check(supabase.from('requests').insert({ session_id: sessionId, date, user_id: userId })),
  cancelLesson: (sessionId: string, date: string, userId: string, by: 'klant' | 'beheer') =>
    check(supabase.from('cancellations').upsert({ session_id: sessionId, date, user_id: userId, cancelled_by: by }, { ignoreDuplicates: true })),
  cancelLessons: (sessionId: string, dates: string[], userId: string) =>
    check(supabase.from('cancellations').upsert(dates.map((date) => ({ session_id: sessionId, date, user_id: userId, cancelled_by: 'beheer' })), { ignoreDuplicates: true })),
  undoCancel: (sessionId: string, date: string, userId: string) =>
    check(supabase.from('cancellations').delete().match({ session_id: sessionId, date, user_id: userId })),
  deleteFutureCancels: (sessionId: string, userId: string, fromDate: string) =>
    check(supabase.from('cancellations').delete().match({ session_id: sessionId, user_id: userId }).gte('date', fromDate)),

  async resolveRequest(requestId: string, approved: boolean, booking: { sessionId: string; date: string; userId: string } | null) {
    if (approved && booking) {
      await check(supabase.from('bookings').upsert({ session_id: booking.sessionId, date: booking.date, user_id: booking.userId }));
    }
    await check(supabase.from('requests').delete().eq('id', requestId));
  },

  addEnrollment: (sessionId: string, start: string, userId: string, weeks: number) =>
    check(supabase.from('enrollments').insert({ session_id: sessionId, start_date: start, user_id: userId, weeks })),
  setEnrollmentWeeks: (enrollmentId: string, weeks: number) =>
    check(weeks === 0 ? supabase.from('enrollments').delete().eq('id', enrollmentId) : supabase.from('enrollments').update({ weeks }).eq('id', enrollmentId)),

  setCapacity: (sessionId: string, date: string, capacity: number) =>
    check(supabase.from('capacity_overrides').upsert({ session_id: sessionId, date, capacity })),
  updateSession: (sessionId: string, fields: { capacity?: number; until?: string | null }) =>
    check(
      supabase
        .from('sessions')
        .update({ ...(fields.capacity !== undefined && { capacity: fields.capacity }), ...(fields.until !== undefined && { until_date: fields.until }) })
        .eq('id', sessionId)
    ),
  addSession: (s: Omit<Session, 'id'>) => {
    const [start, end] = s.time.split(' – ').map(colonTime);
    return check(
      supabase.from('sessions').insert({ day: s.day, style: s.style, start_time: start, end_time: end, capacity: s.capacity, from_date: s.from, until_date: s.until })
    );
  },
  removeSession: (sessionId: string) => check(supabase.from('sessions').delete().eq('id', sessionId)),
  addClosure: (c: Omit<Closure, 'id'>) =>
    check(supabase.from('closures').insert({ from_date: c.from, to_date: c.to, session_id: c.sessionId, reason: c.reason })),
  removeClosure: (closureId: string) => check(supabase.from('closures').delete().eq('id', closureId)),

  // Attendance drafts: `attendeeId` is a user id for app customers.
  setPresent: (sessionId: string, date: string, attendeeId: string, present: boolean) =>
    check(supabase.from('attendance_drafts').upsert({ session_id: sessionId, date, attendee_id: attendeeId, present })),
  addAttendee: (sessionId: string, date: string, attendeeId: string, a: Attendee) =>
    check(
      supabase.from('attendance_drafts').upsert({
        session_id: sessionId, date, attendee_id: attendeeId, name: a.name, uses_app: a.usesApp, walk_in: !!a.walkIn, added: true, present: true,
      })
    ),
  removeAttendee: (sessionId: string, date: string, attendeeId: string) =>
    check(supabase.from('attendance_drafts').delete().match({ session_id: sessionId, date, attendee_id: attendeeId })),
  confirmAttendance: (sessionId: string, date: string, people: Confirmation['people'], userIdOf: (key: string) => string | undefined) =>
    check(
      supabase.rpc('confirm_attendance', {
        p_session: sessionId,
        p_date: date,
        p_records: people.map((p) => {
          const userId = p.usesApp ? userIdOf(p.id) : undefined;
          return {
            attendee_id: userId ?? p.id, user_id: userId ?? null, name: p.name, uses_app: p.usesApp, walk_in: !!p.walkIn,
            planned: p.planned, present: p.present, charge: p.charge,
          };
        }),
      })
    ),
  undoConfirmation: (sessionId: string, date: string) => check(supabase.rpc('undo_confirmation', { p_session: sessionId, p_date: date })),

  // Customers
  setStrips: (userId: string, strippen: number | null, total?: number) =>
    check(supabase.from('profiles').update({ strippen, ...(total !== undefined && { total }) }).eq('id', userId)),
  setTermsAccepted: (userId: string, acceptedAt: string | null) =>
    check(supabase.from('profiles').update({ terms_accepted_at: toIsoDate(acceptedAt) }).eq('id', userId)),
  adjustStrips: (userId: string, delta: number) => check(supabase.rpc('admin_adjust_strips', { p_id: userId, p_delta: delta })),
  deleteCustomer: (userId: string) => check(supabase.rpc('admin_delete_customer', { p_id: userId })),
  createCustomer: (name: string, email: string, phone: string, origin: CustomerOrigin) =>
    check(supabase.rpc('admin_create_customer', { p_name: name, p_email: email, p_phone: phone, p_origin: origin })),
  deleteOwnAccount: () => check(supabase.rpc('delete_own_account')),
};
