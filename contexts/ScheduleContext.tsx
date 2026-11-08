import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { useData } from '@/contexts/DataContext';
import { useUsers } from '@/contexts/UsersContext';
import type { Session } from '@/data/schedule';
import { daysBetween, isoOf, plusDays } from '@/lib/dutchDate';
import { remote } from '@/lib/remote';
import * as rules from '@/lib/schedule';
import type {
  AttendanceEntry,
  Attendee,
  Cancellation,
  Charge,
  Closure,
  Confirmation,
  Enrollment,
  Lesson,
  LessonStatus,
  Occupancy,
  OpenCancellation,
  Person,
  PrivateLesson,
  ReservationRequest,
  ScheduleData,
} from '@/lib/schedule';

export type {
  AttendanceEntry,
  Attendee,
  Closure,
  Confirmation,
  Enrollment,
  Lesson,
  LessonStatus,
  Occupancy,
  OpenCancellation,
  PrivateLesson,
  ReservationRequest,
} from '@/lib/schedule';

type ScheduleContextValue = {
  data: ScheduleData;
  now: Date;
  today: string;
  sessionById: (sessionId: string) => Session | undefined;
  sessionsOn: (date: string) => Session[];
  closureOf: (sessionId: string, date: string) => Closure | undefined;
  statusFor: (email: string, sessionId: string, date: string) => LessonStatus | null;
  attendees: (sessionId: string, date: string) => { person: Person; status: LessonStatus }[];
  occupancy: (sessionId: string, date: string) => Occupancy;
  myLessons: (email: string, from: string, to: string) => Lesson[];
  activeEnrollmentsOf: (email: string) => Enrollment[];
  upcomingStandingDates: (enrollment: Enrollment) => string[];
  closurePreview: (from: string, to: string, sessionId: string | null) => { lessons: number; scheduled: number } | null;
  hasStarted: (session: Session, date: string) => boolean;
  isPast: (session: Session, date: string) => boolean;
  // Cancelling now would cost a strip (within LATE_CANCEL_HOURS of the start).
  isLateCancel: (session: Session, date: string) => boolean;
  cancellationOf: (email: string, sessionId: string, date: string) => Cancellation | undefined;
  // Customer
  requestLesson: (sessionId: string, date: string, person: Person) => boolean;
  cancelLesson: (email: string, sessionId: string, date: string, by: 'klant' | 'beheer') => void;
  undoCancel: (email: string, sessionId: string, date: string) => boolean;
  // Admin
  resolveRequest: (requestId: string, approved: boolean) => void;
  addStanding: (sessionId: string, date: string, email: string, weeks: number) => boolean;
  removeStanding: (sessionId: string, date: string, email: string, weeks: number) => 'gestopt' | 'afgemeld';
  stopStanding: (enrollmentId: string) => void;
  adjustCapacity: (sessionId: string, date: string, delta: number) => void;
  adjustDefaultCapacity: (sessionId: string, delta: number) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
  removeExtraSession: (sessionId: string) => void;
  setSessionUntil: (sessionId: string, until: string | null) => void;
  addClosure: (closure: Omit<Closure, 'id'>) => void;
  removeClosure: (closureId: string) => void;
  // Attendance — strips are only deducted when the admin confirms
  attendanceList: (sessionId: string, date: string) => AttendanceEntry[];
  confirmationOf: (sessionId: string, date: string) => Confirmation | undefined;
  unconfirmedLessons: () => { session: Session; date: string }[];
  chargeFor: (email: string, sessionId: string, date: string) => Charge | 'afwezig' | undefined;
  setPresent: (sessionId: string, date: string, attendeeId: string, present: boolean) => void;
  addAttendee: (sessionId: string, date: string, attendee: Attendee) => void;
  removeAttendee: (sessionId: string, date: string, attendeeId: string) => void;
  confirmAttendance: (sessionId: string, date: string) => { present: number; strips: number };
  undoConfirmation: (sessionId: string, date: string) => void;
  // Private lessons (no strips): planned by the admin, cancellable by the customer until the start
  privatesOf: (email: string) => PrivateLesson[];
  upcomingPrivates: () => PrivateLesson[];
  addPrivateLesson: (email: string, date: string, time: string) => void;
  removePrivateLesson: (id: string) => void;
  cancelPrivateLesson: (id: string) => void;
  // Afmeldingen: customers' cancellations until the admin taps Akkoord (changes nothing else)
  openCancellations: () => OpenCancellation[];
  acknowledgeCancellation: (item: OpenCancellation) => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

// The per-date schedule from Supabase (see DataContext). Checks run on the loaded
// data first; writes go to the database, after which everything reloads — so the
// student screens, the Docentmodus screens and the portal always agree.
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { data, run } = useData();
  const { users, students, userIdOf } = useUsers();
  const [now, setNow] = useState(() => new Date());

  // Keep "now" fresh so lessons move from upcoming to finished while the app is open.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // A person key is an e-mail for profiles we can see, otherwise already a user id.
  const idOf = (key: string) => userIdOf(key) ?? key;

  const occupancy = (sessionId: string, date: string) => rules.occupancy(data, students, sessionId, date);

  const requestLesson = (sessionId: string, date: string, person: Person) => {
    if (rules.statusFor(data, person.email, sessionId, date) || occupancy(sessionId, date).available <= 0) return false;
    run(() => remote.requestLesson(sessionId, date, idOf(person.email)));
    return true;
  };

  const cancelLesson = (email: string, sessionId: string, date: string, by: 'klant' | 'beheer') => {
    if (!rules.isCancelled(data, email, sessionId, date)) run(() => remote.cancelLesson(sessionId, date, idOf(email), by));
  };

  // Coming back is only possible while the freed spot hasn't been taken.
  const undoCancel = (email: string, sessionId: string, date: string) => {
    if (occupancy(sessionId, date).available <= 0) return false;
    run(() => remote.undoCancel(sessionId, date, idOf(email)));
    return true;
  };

  // Approving turns the request into a booking; rejecting just drops it,
  // which releases the spot it was holding.
  const resolveRequest = (requestId: string, approved: boolean) => {
    const request = data.requests.find((r) => r.id === requestId);
    if (!request) return;
    run(() =>
      remote.resolveRequest(requestId, approved, { sessionId: request.sessionId, date: request.date, userId: idOf(request.email) })
    );
  };

  const addStanding = (sessionId: string, date: string, email: string, weeks: number) => {
    if (occupancy(sessionId, date).available <= 0 || rules.enrollmentOf(data, email, sessionId, date)) return false;
    run(() => remote.addEnrollment(sessionId, date, idOf(email), weeks));
    return true;
  };

  // Off for `weeks` weeks from `date`; covering the rest of the enrollment
  // (e.g. the 99 "ongoing" choice) ends the standing lesson instead.
  const removeStanding = (sessionId: string, date: string, email: string, weeks: number) => {
    const enrollment = rules.enrollmentOf(data, email, sessionId, date);
    if (!enrollment) return 'afgemeld';
    const weekIndex = daysBetween(enrollment.start, date) / 7;
    if (weeks >= enrollment.weeks - weekIndex) {
      run(() => remote.setEnrollmentWeeks(enrollment.id, weekIndex));
      return 'gestopt';
    }
    const dates = Array.from({ length: weeks }, (_, week) => plusDays(date, 7 * week)).filter(
      (d) => !rules.isCancelled(data, email, sessionId, d)
    );
    run(() => remote.cancelLessons(sessionId, dates, idOf(email)));
    return 'afgemeld';
  };

  // Ends a standing lesson after the last lesson that started, and drops its later cancellations.
  const stopStanding = (enrollmentId: string) => {
    const result = rules.stopEnrollment(data, enrollmentId, new Date());
    const enrollment = data.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment || !result.enrollments) return;
    const weeks = result.enrollments.find((e) => e.id === enrollmentId)?.weeks ?? 0;
    run(async () => {
      await remote.setEnrollmentWeeks(enrollmentId, weeks);
      await remote.deleteFutureCancels(enrollment.sessionId, idOf(enrollment.email), isoOf(new Date()));
    });
  };

  const adjustCapacity = (sessionId: string, date: string, delta: number) => {
    const capacity = Math.max(0, occupancy(sessionId, date).capacity + delta);
    run(() => remote.setCapacity(sessionId, date, capacity));
  };

  const adjustDefaultCapacity = (sessionId: string, delta: number) => {
    const session = data.sessions.find((s) => s.id === sessionId);
    if (session) run(() => remote.updateSession(sessionId, { capacity: Math.max(1, session.capacity + delta) }));
  };

  const setSessionUntil = (sessionId: string, until: string | null) => run(() => remote.updateSession(sessionId, { until }));

  const addSession = (session: Omit<Session, 'id'>) => run(() => remote.addSession(session));

  // Bookings, requests and enrollments of a removed extra lesson go with it (cascade).
  const removeExtraSession = (sessionId: string) => run(() => remote.removeSession(sessionId));

  const addClosure = (closure: Omit<Closure, 'id'>) => run(() => remote.addClosure(closure));

  const removeClosure = (closureId: string) => run(() => remote.removeClosure(closureId));

  // Attendance ids are e-mails for app customers in the app, user ids in the database.
  const attendeeDbId = (attendeeId: string) => userIdOf(attendeeId) ?? attendeeId;

  const setPresent = (sessionId: string, date: string, attendeeId: string, present: boolean) =>
    run(() => remote.setPresent(sessionId, date, attendeeDbId(attendeeId), present));

  const addAttendee = (sessionId: string, date: string, attendee: Attendee) =>
    run(() => remote.addAttendee(sessionId, date, attendeeDbId(attendee.id), attendee));

  const removeAttendee = (sessionId: string, date: string, attendeeId: string) =>
    run(() => remote.removeAttendee(sessionId, date, attendeeDbId(attendeeId)));

  // The database deducts the strips in the same transaction (confirm_attendance).
  const confirmAttendance = (sessionId: string, date: string) => {
    const stripsOf = (email: string) => users.find((u) => u.email === email)?.strippen ?? null;
    const { confirmation } = rules.settleAttendance(data, students, sessionId, date, stripsOf, '');
    run(() => remote.confirmAttendance(sessionId, date, confirmation.people, userIdOf));
    return {
      present: confirmation.people.filter((p) => p.present).length,
      strips: confirmation.people.filter((p) => p.charge === 'strip').length,
    };
  };

  // Refunds the deducted strips and makes the list editable again.
  const undoConfirmation = (sessionId: string, date: string) => run(() => remote.undoConfirmation(sessionId, date));

  return (
    <ScheduleContext.Provider
      value={{
        data,
        now,
        today: isoOf(now),
        sessionById: (sessionId) => data.sessions.find((s) => s.id === sessionId),
        sessionsOn: (date) => rules.sessionsOn(data, date),
        closureOf: (sessionId, date) => rules.closureOf(data, sessionId, date),
        statusFor: (email, sessionId, date) => rules.statusFor(data, email, sessionId, date),
        attendees: (sessionId, date) => rules.attendees(data, students, sessionId, date),
        occupancy,
        myLessons: (email, from, to) => rules.myLessons(data, email, from, to),
        activeEnrollmentsOf: (email) => rules.activeEnrollmentsOf(data, email, isoOf(now)),
        upcomingStandingDates: (enrollment) => rules.upcomingStandingDates(data, enrollment, now),
        closurePreview: (from, to, sessionId) => rules.closurePreview(data, students, from, to, sessionId),
        hasStarted: (session, date) => rules.hasStarted(session, date, now),
        isPast: (session, date) => rules.isPast(session, date, now),
        isLateCancel: (session, date) => rules.isLateCancel(session, date, now),
        cancellationOf: (email, sessionId, date) => rules.cancellationOf(data, email, sessionId, date),
        requestLesson,
        cancelLesson,
        undoCancel,
        resolveRequest,
        addStanding,
        removeStanding,
        stopStanding,
        adjustCapacity,
        adjustDefaultCapacity,
        addSession,
        removeExtraSession,
        setSessionUntil,
        addClosure,
        removeClosure,
        attendanceList: (sessionId, date) => rules.attendanceList(data, students, sessionId, date),
        confirmationOf: (sessionId, date) => rules.confirmationOf(data, sessionId, date),
        unconfirmedLessons: () => rules.unconfirmedLessons(data, now),
        chargeFor: (email, sessionId, date) => rules.chargeFor(data, email, sessionId, date),
        setPresent,
        addAttendee,
        removeAttendee,
        confirmAttendance,
        undoConfirmation,
        privatesOf: (email) => rules.privatesOf(data, email),
        upcomingPrivates: () => rules.upcomingPrivates(data, now),
        addPrivateLesson: (email, date, time) => run(() => remote.addPrivateLesson(idOf(email), date, time)),
        removePrivateLesson: (id) => run(() => remote.removePrivateLesson(id)),
        cancelPrivateLesson: (id) => run(() => remote.cancelPrivateLesson(id)),
        openCancellations: () => rules.openCancellations(data),
        acknowledgeCancellation: (item) =>
          run(() =>
            item.kind === 'prive'
              ? remote.acknowledgePrivateCancel(item.privateId)
              : remote.acknowledgeCancellation(item.sessionId, item.date, idOf(item.email))
          ),
      }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return ctx;
}
