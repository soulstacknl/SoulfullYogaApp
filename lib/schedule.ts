// Pure scheduling rules — everything is derived per lesson date (session id +
// ISO date) from enrollments, bookings, requests, cancellations and closures.
// Kept free of React so the same rules can move to Supabase queries later.
import { initialRoster } from '@/data/roster';
import type { RosterEntry } from '@/data/roster';
import { initialSessions } from '@/data/schedule';
import type { Session } from '@/data/schedule';
import { daysBetween, isoOf, plusDays, toDate, weekdayOf, WEEKDAYS } from '@/lib/dutchDate';

// Standing customer of a weekly session, for `weeks` weeks starting on `start`.
export type Enrollment = { id: string; sessionId: string; email: string; start: string; weeks: number };
// Approved one-off booking for a single lesson date.
export type Booking = { sessionId: string; date: string; email: string };
// One-off booking waiting for the teacher's approval — already holds a spot.
export type ReservationRequest = { id: string; sessionId: string; date: string; email: string; name: string };
// Customer is off for one lesson date: it doesn't count and costs no strip.
export type Cancellation = { sessionId: string; date: string; email: string; by: 'klant' | 'beheer' };
// Lessons that don't take place (holiday); sessionId null = every lesson in the period.
export type Closure = { id: string; from: string; to: string; sessionId: string | null; reason: string };
export type Charge = 'strip' | 'open';

export type ScheduleData = {
  sessions: Session[];
  roster: Record<string, RosterEntry[]>;
  enrollments: Enrollment[];
  bookings: Booking[];
  requests: ReservationRequest[];
  cancels: Cancellation[];
  closures: Closure[];
  charged: Record<string, Record<string, Charge>>; // per email: lesson key → how it was paid
  capOverride: Record<string, number>; // per lesson key, when the admin changed one date
  checkins: Record<string, Record<string, boolean>>; // per lesson key: attendee id → present
};

export type LessonSource = 'vast' | 'los' | 'aanvraag';
export type LessonStatus = { source: LessonSource; cancelled: boolean; enrollment?: Enrollment };
export type Lesson = { session: Session; date: string; status: LessonStatus; closure: Closure | undefined };
export type Person = { email: string; name: string };
export type Occupancy = { capacity: number; booked: number; available: number };

// Weeks prompt value meaning "ongoing" — long enough to never run out in practice.
export const ONGOING_WEEKS = 99;
export const MONTHS_AHEAD = 3;

export const lessonKey = (sessionId: string, date: string) => `${sessionId}@${date}`;
export const startTimeOf = (session: Session) => session.time.split(' – ')[0];
export const startOf = (session: Session, date: string) => toDate(date, startTimeOf(session));
export const endOf = (session: Session, date: string) => toDate(date, session.time.split(' – ')[1]);
export const hasStarted = (session: Session, date: string, now: Date) => startOf(session, date) <= now;
export const isPast = (session: Session, date: string, now: Date) => endOf(session, date) <= now;
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

export const isCancelled = (data: ScheduleData, email: string, sessionId: string, date: string) =>
  data.cancels.some((c) => c.email === email && c.sessionId === sessionId && c.date === date);

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

export function occupancy(data: ScheduleData, people: Person[], sessionId: string, date: string): Occupancy {
  const session = data.sessions.find((s) => s.id === sessionId);
  const capacity = data.capOverride[lessonKey(sessionId, date)] ?? session?.capacity ?? 0;
  const booked = (data.roster[sessionId] ?? []).length + attendees(data, people, sessionId, date).length;
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

  return [...found.values()]
    .map(({ session, date }) => ({
      session,
      date,
      status: statusFor(data, email, session.id, date)!,
      closure: closureOf(data, session.id, date),
    }))
    .sort((a, b) => startOf(a.session, a.date).getTime() - startOf(b.session, b.date).getTime());
}

// The weekly session a customer currently has as standing lesson, if any.
export function currentStandingSession(data: ScheduleData, email: string, today: string): Session | undefined {
  const e = data.enrollments.find((x) => x.email === email && plusDays(x.start, 7 * x.weeks) > today);
  return e ? data.sessions.find((s) => s.id === e.sessionId) : undefined;
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

// Every finished lesson a customer was scheduled for (not cancelled, not closed)
// costs one strip; without strips left it's recorded as 'open' (still to pay).
export function pendingCharges(
  data: ScheduleData,
  customers: { email: string; strippen: number | null }[],
  now: Date
): { charges: { email: string; key: string; charge: Charge }[]; stripDeltas: Record<string, number> } | null {
  const charges: { email: string; key: string; charge: Charge }[] = [];
  const stripDeltas: Record<string, number> = {};
  for (const customer of customers) {
    let strips = customer.strippen ?? 0;
    for (const lesson of myLessons(data, customer.email, '2000-01-01', isoOf(now))) {
      const key = lessonKey(lesson.session.id, lesson.date);
      if (
        !isPast(lesson.session, lesson.date, now) ||
        lesson.closure ||
        lesson.status.cancelled ||
        lesson.status.source === 'aanvraag' ||
        data.charged[customer.email]?.[key]
      ) {
        continue;
      }
      if (strips > 0) {
        strips--;
        stripDeltas[customer.email] = (stripDeltas[customer.email] ?? 0) - 1;
        charges.push({ email: customer.email, key, charge: 'strip' });
      } else {
        charges.push({ email: customer.email, key, charge: 'open' });
      }
    }
  }
  return charges.length ? { charges, stripDeltas } : null;
}

/* ── Seed data ─────────────────────────────────────────────────────────── */

// The last `count` dates this session finished, oldest first.
function recentPast(session: Session, count: number, now: Date): string[] {
  const dates: string[] = [];
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    const iso = isoOf(day);
    if (WEEKDAYS[day.getDay()] === session.day && endOf(session, iso) <= now) dates.unshift(iso);
    day.setDate(day.getDate() - 1);
  }
  return dates;
}

// A standing customer who has been attending for a few weeks; those lessons are already paid.
function seedStanding(
  data: ScheduleData,
  email: string,
  sessionId: string,
  pastWeeks: number,
  cancelledWeeks: number[],
  weeks: number,
  now: Date
) {
  const session = data.sessions.find((s) => s.id === sessionId)!;
  const dates = recentPast(session, pastWeeks, now);
  data.enrollments.push({ id: `e-${sessionId}-${email}`, sessionId, email, start: dates[0], weeks });
  data.charged[email] = data.charged[email] ?? {};
  dates.forEach((date, i) => {
    if (cancelledWeeks.includes(i)) data.cancels.push({ sessionId, date, email, by: 'klant' });
    else data.charged[email][lessonKey(sessionId, date)] = 'strip';
  });
}

export function initialScheduleData(now = new Date()): ScheduleData {
  let year = now.getFullYear();
  if (new Date(year, 11, 21) < now) year++;
  const data: ScheduleData = {
    sessions: initialSessions.map((s) => ({ ...s })),
    roster: Object.fromEntries(Object.entries(initialRoster).map(([id, list]) => [id, list.map((e) => ({ ...e }))])),
    enrollments: [],
    bookings: [],
    requests: [],
    cancels: [],
    closures: [{ id: 'c-kerst', from: `${year}-12-21`, to: `${year + 1}-01-03`, sessionId: null, reason: 'Kerstvakantie' }],
    charged: {},
    capOverride: {},
    checkins: {},
  };
  // Matches the strip balances in data/users.ts (7 and 5 left).
  seedStanding(data, 'marieke@soulfulyoga.nl', 'tue-1', 4, [1], ONGOING_WEEKS, now);
  seedStanding(data, 'marjolijn_n@hotmail.com', 'thu-2', 3, [], 12, now);
  return data;
}
