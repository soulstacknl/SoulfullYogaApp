// Pure scheduling rules — everything is derived per lesson date (session id +
// ISO date) from enrollments, bookings, requests, cancellations and closures.
// Kept free of React so the same rules can move to Supabase queries later.
import type { RosterEntry } from '@/data/roster';
import type { Session } from '@/data/schedule';
import { daysBetween, isoOf, plusDays, toDate, weekdayOf, WEEKDAYS } from '@/lib/dutchDate';

// Standing customer of a weekly session, for `weeks` weeks starting on `start`.
export type Enrollment = { id: string; sessionId: string; email: string; start: string; weeks: number };
// Approved one-off booking for a single lesson date.
export type Booking = { sessionId: string; date: string; email: string };
// One-off booking waiting for the teacher's approval — already holds a spot.
export type ReservationRequest = { id: string; sessionId: string; date: string; email: string; name: string };
// Customer is off for one lesson date. Free up to LATE_CANCEL_HOURS before the start;
// later the customer pays one strip (late/charged are set by the database).
export type Cancellation = {
  sessionId: string;
  date: string;
  email: string;
  by: 'klant' | 'beheer';
  late?: boolean;
  charged?: boolean;
};
// Lessons that don't take place (holiday); sessionId null = every lesson in the period.
export type Closure = { id: string; from: string; to: string; sessionId: string | null; reason: string };
// How a present attendee was settled when the admin confirmed the attendance list:
// one strip, 'open' (no strips left, still to pay) or 'los' (walk-in without a card).
export type Charge = 'strip' | 'open' | 'los';
export type Attendee = { id: string; name: string; usesApp: boolean; walkIn?: boolean };
export type AttendanceEntry = Attendee & { planned: boolean; present: boolean };
export type Confirmation = { at: string; people: (AttendanceEntry & { charge: Charge | null })[] };

export type ScheduleData = {
  sessions: Session[];
  roster: Record<string, RosterEntry[]>;
  enrollments: Enrollment[];
  bookings: Booking[];
  requests: ReservationRequest[];
  cancels: Cancellation[];
  closures: Closure[];
  capOverride: Record<string, number>; // per lesson key, when the admin changed one date
  checkins: Record<string, Record<string, boolean>>; // per lesson key: attendee id → present (draft)
  extras: Record<string, Attendee[]>; // per lesson key: people the admin added to the list
  confirmed: Record<string, Confirmation>; // per lesson key — strips are only deducted here
};

// 'extra' = not scheduled, but confirmed present by the admin.
export type LessonSource = 'vast' | 'los' | 'aanvraag' | 'extra';
export type LessonStatus = { source: LessonSource; cancelled: boolean; enrollment?: Enrollment };
export type Lesson = { session: Session; date: string; status: LessonStatus; closure: Closure | undefined };
export type Person = { email: string; name: string };
export type Occupancy = { capacity: number; booked: number; available: number };

// Weeks prompt value meaning "ongoing" — long enough to never run out in practice.
export const ONGOING_WEEKS = 99;
export const MONTHS_AHEAD = 3;
// Terms art. 5.4: cancelling later than this before the start costs a strip.
export const LATE_CANCEL_HOURS = 24;

// Last day customers can see ahead: the end of the month MONTHS_AHEAD months from now.
export const horizonEnd = (now: Date) => isoOf(new Date(now.getFullYear(), now.getMonth() + MONTHS_AHEAD + 1, 0));

export const lessonKey = (sessionId: string, date: string) => `${sessionId}@${date}`;
export const startTimeOf = (session: Session) => session.time.split(' – ')[0];
export const startOf = (session: Session, date: string) => toDate(date, startTimeOf(session));
export const endOf = (session: Session, date: string) => toDate(date, session.time.split(' – ')[1]);
export const hasStarted = (session: Session, date: string, now: Date) => startOf(session, date) <= now;
export const isLateCancel = (session: Session, date: string, now: Date) =>
  startOf(session, date).getTime() - now.getTime() < LATE_CANCEL_HOURS * 3600 * 1000;
// What cancelling costs, shown before the customer confirms.
export function cancelNotice(late: boolean, paysStrip: boolean) {
  if (!late) return `Kosteloos tot ${LATE_CANCEL_HOURS} uur voor aanvang: er gaat geen strip af.`;
  if (paysStrip) return `Deze les begint binnen ${LATE_CANCEL_HOURS} uur. Volgens de voorwaarden wordt er bij afmelden 1 strip afgeschreven.`;
  return `Deze les begint binnen ${LATE_CANCEL_HOURS} uur. Volgens de voorwaarden wordt afmelden binnen ${LATE_CANCEL_HOURS} uur in rekening gebracht.`;
}
export const isPast =(session: Session, date: string, now: Date) => endOf(session, date) <= now;
export const isExtra = (session: Session) => session.from !== null && session.from === session.until;

export const activeOn = (session: Session, date: string) =>
  session.day === weekdayOf(date) &&
  (!session.from || date >= session.from) &&
  (!session.until || date <= session.until);

export const sessionsOn = (data: ScheduleData, date: string) =>
  data.sessions.filter((s) => activeOn(s, date)).sort((a, b) => a.time.localeCompare(b.time));

export const closureOf = (data: ScheduleData, sessionId: string, date: string) =>
  data.closures.find(
    (c) => date >= c.from && date <= c.to && (c.sessionId === null || c.sessionId === sessionId)
  );

const covers = (e: Enrollment, date: string) => {
  const days = daysBetween(e.start, date);
  return days >= 0 && days % 7 === 0 && days / 7 < e.weeks;
};

export const enrollmentOf = (data: ScheduleData, email: string, sessionId: string, date: string) =>
  data.enrollments.find((e) => e.email === email && e.sessionId === sessionId && covers(e, date));

export const cancellationOf = (data: ScheduleData, email: string, sessionId: string, date: string) =>
  data.cancels.find((c) => c.email === email && c.sessionId === sessionId && c.date === date);
export const isCancelled = (data: ScheduleData, email: string, sessionId: string, date: string) =>
  !!cancellationOf(data, email, sessionId, date);

// How a customer is scheduled for one lesson date, or null if not at all.
export function statusFor(data: ScheduleData, email: string, sessionId: string, date: string): LessonStatus | null {
  const enrollment = enrollmentOf(data, email, sessionId, date);
  const booking = data.bookings.some((b) => b.email === email && b.sessionId === sessionId && b.date === date);
  if (enrollment || booking) {
    return { source: enrollment ? 'vast' : 'los', cancelled: isCancelled(data, email, sessionId, date), enrollment };
  }
  const requested = data.requests.some((r) => r.email === email && r.sessionId === sessionId && r.date === date);
  return requested ? { source: 'aanvraag', cancelled: false } : null;
}

// App customers taking part on this date (pending requests hold a spot too).
export function attendees<P extends Person>(data: ScheduleData, people: P[], sessionId: string, date: string) {
  return people
    .map((person) => ({ person, status: statusFor(data, person.email, sessionId, date) }))
    .filter((a): a is { person: P; status: LessonStatus } => a.status !== null && !a.status.cancelled);
}

// Everyone taking part on this date by key (pending requests hold a spot too) —
// also people whose profile the current user can't see, such as other customers.
export function participantKeys(data: ScheduleData, sessionId: string, date: string): Set<string> {
  const keys = new Set<string>();
  data.enrollments.filter((e) => e.sessionId === sessionId && covers(e, date)).forEach((e) => keys.add(e.email));
  data.bookings.filter((b) => b.sessionId === sessionId && b.date === date).forEach((b) => keys.add(b.email));
  data.requests.filter((r) => r.sessionId === sessionId && r.date === date).forEach((r) => keys.add(r.email));
  data.cancels.filter((c) => c.sessionId === sessionId && c.date === date).forEach((c) => keys.delete(c.email));
  return keys;
}

export function occupancy(data: ScheduleData, _people: Person[], sessionId: string, date: string): Occupancy {
  const session = data.sessions.find((s) => s.id === sessionId);
  const capacity = data.capOverride[lessonKey(sessionId, date)] ?? session?.capacity ?? 0;
  const booked = (data.roster[sessionId] ?? []).length + participantKeys(data, sessionId, date).size;
  return { capacity, booked, available: Math.max(0, capacity - booked) };
}

// Every lesson a customer is scheduled for between two dates, in time order.
export function myLessons(data: ScheduleData, email: string, from: string, to: string): Lesson[] {
  const found = new Map<string, { session: Session; date: string }>();
  const add = (sessionId: string, date: string) => {
    const session = data.sessions.find((s) => s.id === sessionId);
    if (session && date >= from && date <= to && activeOn(session, date)) {
      found.set(lessonKey(sessionId, date), { session, date });
    }
  };
  for (const e of data.enrollments.filter((x) => x.email === email)) {
    for (let week = 0; week < e.weeks; week++) {
      const date = plusDays(e.start, 7 * week);
      if (date > to) break;
      add(e.sessionId, date);
    }
  }
  data.bookings.filter((b) => b.email === email).forEach((b) => add(b.sessionId, b.date));
  data.requests.filter((r) => r.email === email).forEach((r) => add(r.sessionId, r.date));
  // Also lessons where the admin confirmed this customer as (extra) present.
  for (const [key, confirmation] of Object.entries(data.confirmed)) {
    if (confirmation.people.some((p) => p.id === email && p.present)) {
      const [sessionId, date] = key.split('@');
      add(sessionId, date);
    }
  }

  return [...found.values()]
    .map(({ session, date }) => ({
      session,
      date,
      status: statusFor(data, email, session.id, date) ?? { source: 'extra' as const, cancelled: false },
      closure: closureOf(data, session.id, date),
    }))
    .sort((a, b) => startOf(a.session, a.date).getTime() - startOf(b.session, b.date).getTime());
}

// A standing lesson is active as long as one of its lessons falls on or after today.
export const lastLessonOf = (e: Enrollment) => plusDays(e.start, 7 * (e.weeks - 1));
export const isActiveEnrollment = (e: Enrollment, today: string) => e.weeks > 0 && lastLessonOf(e) >= today;

// The weekly session a customer currently has as standing lesson, if any.
export function currentStandingSession(data: ScheduleData, email: string, today: string): Session | undefined {
  const e = data.enrollments.find((x) => x.email === email && isActiveEnrollment(x, today));
  return e ? data.sessions.find((s) => s.id === e.sessionId) : undefined;
}

// Active standing enrollments of a customer whose session still exists.
export const activeEnrollmentsOf = (data: ScheduleData, email: string, today: string) =>
  data.enrollments.filter(
    (e) => e.email === email && isActiveEnrollment(e, today) && data.sessions.some((s) => s.id === e.sessionId)
  );

// First date on or after `from` (within a week) this session takes place, or null.
export function nextOccurrence(session: Session, from: string): string | null {
  for (let i = 0; i < 7; i++) {
    const date = plusDays(from, i);
    if (activeOn(session, date)) return date;
  }
  return null;
}

// Standing lessons that haven't started yet (up to the horizon) — what stopping would remove.
export function upcomingStandingDates(data: ScheduleData, enrollment: Enrollment, now: Date): string[] {
  const session = data.sessions.find((s) => s.id === enrollment.sessionId);
  if (!session) return [];
  const end = horizonEnd(now);
  const dates: string[] = [];
  for (let week = 0; week < enrollment.weeks; week++) {
    const date = plusDays(enrollment.start, 7 * week);
    if (date > end) break;
    if (activeOn(session, date) && !hasStarted(session, date, now)) dates.push(date);
  }
  return dates;
}

// Ends a standing lesson after the last lesson that already started; later
// cancellations for it go too, so nothing of it is left in the schedule.
export function stopEnrollment(data: ScheduleData, enrollmentId: string, now: Date): Partial<ScheduleData> {
  const enrollment = data.enrollments.find((e) => e.id === enrollmentId);
  const session = enrollment && data.sessions.find((s) => s.id === enrollment.sessionId);
  if (!enrollment || !session) return {};
  let started = 0;
  while (started < enrollment.weeks && hasStarted(session, plusDays(enrollment.start, 7 * started), now)) started++;
  const today = isoOf(now);
  return {
    enrollments:
      started === 0
        ? data.enrollments.filter((e) => e.id !== enrollmentId)
        : data.enrollments.map((e) => (e.id !== enrollmentId ? e : { ...e, weeks: started })),
    cancels: data.cancels.filter(
      (c) => !(c.email === enrollment.email && c.sessionId === enrollment.sessionId && c.date >= today)
    ),
  };
}

// What a holiday would affect: lessons dropped, and how often an app customer was scheduled.
export function closurePreview(
  data: ScheduleData,
  people: Person[],
  from: string,
  to: string,
  sessionId: string | null
): { lessons: number; scheduled: number } | null {
  if (!from || !to || to < from || daysBetween(from, to) > 400) return null;
  let lessons = 0;
  let scheduled = 0;
  for (let date = from; date <= to; date = plusDays(date, 1)) {
    for (const session of sessionsOn(data, date)) {
      if (sessionId && session.id !== sessionId) continue;
      lessons++;
      scheduled += attendees(data, people, session.id, date).length;
    }
  }
  return { lessons, scheduled };
}

/* ── Attendance & confirmation ─────────────────────────────────────────── */
// Strips are only deducted when the admin confirms who was actually there —
// the schedule is just the starting point of the attendance list.

export const confirmationOf = (data: ScheduleData, sessionId: string, date: string) =>
  data.confirmed[lessonKey(sessionId, date)];

// Who should be there according to the schedule (app customers + regular attendees
// without the app), plus anyone the admin added. Everyone starts as present.
export function attendanceList(data: ScheduleData, people: Person[], sessionId: string, date: string): AttendanceEntry[] {
  const key = lessonKey(sessionId, date);
  const draft = data.checkins[key] ?? {};
  const planned: Attendee[] = [
    ...attendees(data, people, sessionId, date)
      .filter((a) => a.status.source !== 'aanvraag')
      .map(({ person }) => ({ id: person.email, name: person.name, usesApp: true })),
    ...(data.roster[sessionId] ?? []).map((e) => ({ id: e.id, name: e.name, usesApp: false })),
  ];
  const added = (data.extras[key] ?? []).filter((x) => !planned.some((p) => p.id === x.id));
  return [
    ...planned.map((p) => ({ ...p, planned: true, present: draft[p.id] ?? true })),
    ...added.map((p) => ({ ...p, planned: false, present: draft[p.id] ?? true })),
  ];
}

// One strip per present attendee; without strips left it's 'open', a walk-in is 'los'.
// Returns the confirmation plus the strip changes for app customers and roster entries.
export function settleAttendance(
  data: ScheduleData,
  people: Person[],
  sessionId: string,
  date: string,
  stripsOf: (email: string) => number | null,
  at: string
) {
  const userDeltas: Record<string, number> = {};
  const rosterDeltas: Record<string, number> = {};
  const roster = data.roster[sessionId] ?? [];
  const settled = attendanceList(data, people, sessionId, date).map((p) => {
    if (!p.present) return { ...p, charge: null };
    if (p.walkIn) return { ...p, charge: 'los' as const };
    const strips = p.usesApp ? (stripsOf(p.id) ?? 0) : (roster.find((e) => e.id === p.id)?.strips ?? 0);
    if (strips <= 0) return { ...p, charge: 'open' as const };
    if (p.usesApp) userDeltas[p.id] = -1;
    else rosterDeltas[p.id] = -1;
    return { ...p, charge: 'strip' as const };
  });
  return { confirmation: { at, people: settled } as Confirmation, userDeltas, rosterDeltas };
}

// Started or finished lessons of the last `days` days that still need confirming, newest first.
export function unconfirmedLessons(data: ScheduleData, now: Date, days = 14) {
  const today = isoOf(now);
  const result: { session: Session; date: string }[] = [];
  for (let i = 0; i <= days; i++) {
    const date = plusDays(today, -i);
    for (const session of [...sessionsOn(data, date)].reverse()) {
      if (hasStarted(session, date, now) && !closureOf(data, session.id, date) && !confirmationOf(data, session.id, date)) {
        result.push({ session, date });
      }
    }
  }
  return result;
}

// What was recorded for a customer at a past lesson; undefined = not confirmed yet.
export function chargeFor(data: ScheduleData, email: string, sessionId: string, date: string): Charge | 'afwezig' | undefined {
  const confirmation = confirmationOf(data, sessionId, date);
  if (!confirmation) return undefined;
  const entry = confirmation.people.find((p) => p.id === email);
  return entry?.present ? (entry.charge ?? undefined) : 'afwezig';
}

export const openChargeCount = (data: ScheduleData, email: string) =>
  Object.values(data.confirmed).filter((c) => c.people.some((p) => p.id === email && p.present && p.charge === 'open'))
    .length;

// Nothing loaded yet (before the first fetch from Supabase).
export const emptyScheduleData = (): ScheduleData => ({
  sessions: [],
  roster: {},
  enrollments: [],
  bookings: [],
  requests: [],
  cancels: [],
  closures: [],
  capOverride: {},
  checkins: {},
  extras: {},
  confirmed: {},
});
