import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { useUsers } from '@/contexts/UsersContext';
import type { Session } from '@/data/schedule';
import { daysBetween, isoOf, plusDays } from '@/lib/dutchDate';
import * as rules from '@/lib/schedule';
import type {
  Closure,
  Lesson,
  LessonStatus,
  Occupancy,
  Person,
  ReservationRequest,
  ScheduleData,
} from '@/lib/schedule';

export type { Closure, Lesson, LessonStatus, Occupancy, ReservationRequest } from '@/lib/schedule';

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
  closurePreview: (from: string, to: string, sessionId: string | null) => { lessons: number; scheduled: number } | null;
  hasStarted: (session: Session, date: string) => boolean;
  isPast: (session: Session, date: string) => boolean;
  // Customer
  requestLesson: (sessionId: string, date: string, person: Person) => boolean;
  cancelLesson: (email: string, sessionId: string, date: string, by: 'klant' | 'beheer') => void;
  undoCancel: (email: string, sessionId: string, date: string) => boolean;
  // Admin
  resolveRequest: (requestId: string, approved: boolean) => void;
  addStanding: (sessionId: string, date: string, email: string, weeks: number) => boolean;
  removeStanding: (sessionId: string, date: string, email: string, weeks: number) => 'gestopt' | 'afgemeld';
  adjustCapacity: (sessionId: string, date: string, delta: number) => void;
  adjustDefaultCapacity: (sessionId: string, delta: number) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
  removeExtraSession: (sessionId: string) => void;
  setSessionUntil: (sessionId: string, until: string | null) => void;
  addClosure: (closure: Omit<Closure, 'id'>) => void;
  removeClosure: (closureId: string) => void;
  toggleCheckIn: (sessionId: string, date: string, attendeeId: string) => void;
  adjustRosterStrip: (sessionId: string, entryId: string, delta: number) => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

// Stands in for Supabase `classes`/`bookings`/`users` tables until that's
// connected — shared so the student-facing screens and the Docentmodus admin
// screens read and write the same per-date schedule.
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { students, applyStripDeltas } = useUsers();
  const [data, setData] = useState<ScheduleData>(() => rules.initialScheduleData());
  const [now, setNow] = useState(() => new Date());

  // Keep "now" fresh so lessons move from upcoming to finished while the app is open.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Automatic strip deduction for finished lessons. Charged keys are recorded,
  // so each lesson is only ever deducted once.
  useEffect(() => {
    const result = rules.pendingCharges(data, students, now);
    if (!result) return;
    setData((prev) => {
      const charged = { ...prev.charged };
      for (const { email, key, charge } of result.charges) {
        charged[email] = { ...charged[email], [key]: charge };
      }
      return { ...prev, charged };
    });
    applyStripDeltas(result.stripDeltas);
  }, [data, students, now, applyStripDeltas]);

  const update = (updater: (prev: ScheduleData) => Partial<ScheduleData>) =>
    setData((prev) => ({ ...prev, ...updater(prev) }));

  const occupancy = (sessionId: string, date: string) => rules.occupancy(data, students, sessionId, date);

  const requestLesson = (sessionId: string, date: string, person: Person) => {
    if (rules.statusFor(data, person.email, sessionId, date) || occupancy(sessionId, date).available <= 0) return false;
    update((prev) => ({
      requests: [{ id: `r-${Date.now()}`, sessionId, date, email: person.email, name: person.name }, ...prev.requests],
    }));
    return true;
  };

  const cancelLesson = (email: string, sessionId: string, date: string, by: 'klant' | 'beheer') => {
    update((prev) =>
      rules.isCancelled(prev, email, sessionId, date)
        ? {}
        : { cancels: [...prev.cancels, { sessionId, date, email, by }] }
    );
  };

  // Coming back is only possible while the freed spot hasn't been taken.
  const undoCancel = (email: string, sessionId: string, date: string) => {
    if (occupancy(sessionId, date).available <= 0) return false;
    update((prev) => ({
      cancels: prev.cancels.filter((c) => !(c.email === email && c.sessionId === sessionId && c.date === date)),
    }));
    return true;
  };

  // Approving turns the request into a booking; rejecting just drops it,
  // which releases the spot it was holding.
  const resolveRequest = (requestId: string, approved: boolean) => {
    update((prev) => {
      const request = prev.requests.find((r) => r.id === requestId);
      if (!request) return {};
      return {
        requests: prev.requests.filter((r) => r.id !== requestId),
        bookings: approved
          ? [...prev.bookings, { sessionId: request.sessionId, date: request.date, email: request.email }]
          : prev.bookings,
      };
    });
  };

  const addStanding = (sessionId: string, date: string, email: string, weeks: number) => {
    if (occupancy(sessionId, date).available <= 0 || rules.enrollmentOf(data, email, sessionId, date)) return false;
    update((prev) => ({
      enrollments: [...prev.enrollments, { id: `e-${Date.now()}`, sessionId, email, start: date, weeks }],
    }));
    return true;
  };

  // Off for `weeks` weeks from `date`; covering the rest of the enrollment
  // (e.g. the 99 "ongoing" choice) ends the standing lesson instead.
  const removeStanding = (sessionId: string, date: string, email: string, weeks: number) => {
    const enrollment = rules.enrollmentOf(data, email, sessionId, date);
    if (!enrollment) return 'afgemeld';
    const weekIndex = daysBetween(enrollment.start, date) / 7;
    if (weeks >= enrollment.weeks - weekIndex) {
      update((prev) => ({
        enrollments:
          weekIndex === 0
            ? prev.enrollments.filter((e) => e.id !== enrollment.id)
            : prev.enrollments.map((e) => (e.id !== enrollment.id ? e : { ...e, weeks: weekIndex })),
      }));
      return 'gestopt';
    }
    update((prev) => {
      const extra = Array.from({ length: weeks }, (_, week) => plusDays(date, 7 * week))
        .filter((d) => !rules.isCancelled(prev, email, sessionId, d))
        .map((d) => ({ sessionId, date: d, email, by: 'beheer' as const }));
      return { cancels: [...prev.cancels, ...extra] };
    });
    return 'afgemeld';
  };

  const adjustCapacity = (sessionId: string, date: string, delta: number) => {
    const capacity = Math.max(0, occupancy(sessionId, date).capacity + delta);
    update((prev) => ({ capOverride: { ...prev.capOverride, [rules.lessonKey(sessionId, date)]: capacity } }));
  };

  const updateSession = (sessionId: string, updater: (s: Session) => Session) =>
    update((prev) => ({ sessions: prev.sessions.map((s) => (s.id !== sessionId ? s : updater(s))) }));

  const adjustDefaultCapacity = (sessionId: string, delta: number) =>
    updateSession(sessionId, (s) => ({ ...s, capacity: Math.max(1, s.capacity + delta) }));

  const setSessionUntil = (sessionId: string, until: string | null) =>
    updateSession(sessionId, (s) => ({ ...s, until }));

  const addSession = (session: Omit<Session, 'id'>) =>
    update((prev) => ({ sessions: [...prev.sessions, { ...session, id: `s-${Date.now()}` }] }));

  // Bookings and requests for a removed extra lesson go with it.
  const removeExtraSession = (sessionId: string) =>
    update((prev) => ({
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
      bookings: prev.bookings.filter((b) => b.sessionId !== sessionId),
      requests: prev.requests.filter((r) => r.sessionId !== sessionId),
      cancels: prev.cancels.filter((c) => c.sessionId !== sessionId),
      enrollments: prev.enrollments.filter((e) => e.sessionId !== sessionId),
    }));

  const addClosure = (closure: Omit<Closure, 'id'>) =>
    update((prev) => ({ closures: [...prev.closures, { ...closure, id: `c-${Date.now()}` }] }));

  const removeClosure = (closureId: string) =>
    update((prev) => ({ closures: prev.closures.filter((c) => c.id !== closureId) }));

  // Attendees without the app pay at check-in (undoing refunds it); app
  // customers are charged automatically after the lesson, so for them
  // check-in only records presence.
  const toggleCheckIn = (sessionId: string, date: string, attendeeId: string) =>
    update((prev) => {
      const key = rules.lessonKey(sessionId, date);
      const checkedIn = !prev.checkins[key]?.[attendeeId];
      return {
        checkins: { ...prev.checkins, [key]: { ...prev.checkins[key], [attendeeId]: checkedIn } },
        roster: {
          ...prev.roster,
          [sessionId]: (prev.roster[sessionId] ?? []).map((e) =>
            e.id !== attendeeId ? e : { ...e, strips: e.strips + (checkedIn ? -1 : 1) }
          ),
        },
      };
    });

  const adjustRosterStrip = (sessionId: string, entryId: string, delta: number) =>
    update((prev) => ({
      roster: {
        ...prev.roster,
        [sessionId]: (prev.roster[sessionId] ?? []).map((e) =>
          e.id !== entryId ? e : { ...e, strips: Math.max(0, e.strips + delta) }
        ),
      },
    }));

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
        closurePreview: (from, to, sessionId) => rules.closurePreview(data, students, from, to, sessionId),
        hasStarted: (session, date) => rules.hasStarted(session, date, now),
        isPast: (session, date) => rules.isPast(session, date, now),
        requestLesson,
        cancelLesson,
        undoCancel,
        resolveRequest,
        addStanding,
        removeStanding,
        adjustCapacity,
        adjustDefaultCapacity,
        addSession,
        removeExtraSession,
        setSessionUntil,
        addClosure,
        removeClosure,
        toggleCheckIn,
        adjustRosterStrip,
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
