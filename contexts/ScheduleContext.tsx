import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import type { ClassStyle } from '@/constants/theme';
import { rosterBySession as initialRoster } from '@/data/roster';
import type { RosterEntry } from '@/data/roster';
import { schedule } from '@/data/schedule';
import type { ClassSession, DaySchedule } from '@/data/schedule';

export type ReservationRequest = {
  id: string;
  day: string;
  sessionId: string;
  style: ClassStyle;
  time: string;
  studentName: string;
  studentEmail: string;
  requestedAt: string;
};

export type ClassEnrollment = {
  id: string;
  day: string;
  sessionId: string;
  name: string;
  email: string;
  phone: string;
  weeks: number;
  addedAt: string;
};

type ScheduleContextValue = {
  days: DaySchedule[];
  rosterBySession: Record<string, RosterEntry[]>;
  requests: ReservationRequest[];
  enrollmentsBySession: Record<string, ClassEnrollment[]>;
  hasRequested: (day: string, id: string, email: string) => boolean;
  bookSession: (day: string, id: string, student: { name: string; email: string }) => boolean;
  resolveRequest: (requestId: string, approved: boolean) => void;
  addEnrollment: (
    day: string,
    id: string,
    customer: { name: string; email: string; phone: string },
    weeks: number
  ) => boolean;
  removeEnrollment: (day: string, id: string, enrollmentId: string) => void;
  adjustCapacity: (day: string, id: string, delta: number) => void;
  adjustAvailable: (day: string, id: string, delta: number) => void;
  toggleCheckIn: (sessionId: string, entryId: string) => void;
  adjustStrip: (sessionId: string, entryId: string, delta: number) => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

// Stands in for Supabase `classes`/`bookings`/`users` tables until that's
// connected — shared so the student-facing Rooster tab and the Docentmodus
// admin screens read and write the same capacity/roster data.
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<DaySchedule[]>(schedule);
  const [rosterBySession, setRosterBySession] = useState(initialRoster);
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [enrollmentsBySession, setEnrollmentsBySession] = useState<Record<string, ClassEnrollment[]>>({});

  const updateSession = (day: string, id: string, updater: (session: ClassSession) => ClassSession) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day !== day ? d : { ...d, classes: d.classes.map((c) => (c.id !== id ? c : updater(c))) }
      )
    );
  };

  // Guests share the '—' placeholder email, so only real accounts are deduped —
  // there's no reliable identity to distinguish one anonymous booker from another.
  const hasRequested = (day: string, id: string, email: string) =>
    email !== '—' && requests.some((r) => r.day === day && r.sessionId === id && r.studentEmail === email);

  const bookSession = (day: string, id: string, student: { name: string; email: string }) => {
    if (hasRequested(day, id, student.email)) return false;
    const session = days.find((d) => d.day === day)?.classes.find((c) => c.id === id);
    if (!session || session.available <= 0) return false;
    updateSession(day, id, (s) => ({ ...s, available: Math.max(0, s.available - 1) }));
    setRequests((prev) => [
      {
        id: `${id}-${Date.now()}`,
        day,
        sessionId: id,
        style: session.style,
        time: session.time,
        studentName: student.name,
        studentEmail: student.email,
        requestedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    return true;
  };

  // Approving just clears the request — the spot was already held since the
  // booking was made. Rejecting releases that held spot back to available.
  const resolveRequest = (requestId: string, approved: boolean) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;
    if (!approved) {
      updateSession(request.day, request.sessionId, (s) => ({
        ...s,
        available: Math.min(s.capacity, s.available + 1),
      }));
    }
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  // Admin-managed recurring enrollment (distinct from the one-off request
  // flow) — takes a real spot on the shared capacity like any other booking.
  const addEnrollment = (
    day: string,
    id: string,
    customer: { name: string; email: string; phone: string },
    weeks: number
  ) => {
    const session = days.find((d) => d.day === day)?.classes.find((c) => c.id === id);
    if (!session || session.available <= 0) return false;
    const alreadyEnrolled = (enrollmentsBySession[id] ?? []).some((e) => e.email === customer.email);
    if (alreadyEnrolled) return false;
    updateSession(day, id, (s) => ({ ...s, available: Math.max(0, s.available - 1) }));
    setEnrollmentsBySession((prev) => ({
      ...prev,
      [id]: [
        {
          id: `${id}-${customer.email}-${Date.now()}`,
          day,
          sessionId: id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          weeks,
          addedAt: new Date().toISOString(),
        },
        ...(prev[id] ?? []),
      ],
    }));
    return true;
  };

  const removeEnrollment = (day: string, id: string, enrollmentId: string) => {
    setEnrollmentsBySession((prev) => ({
      ...prev,
      [id]: (prev[id] ?? []).filter((e) => e.id !== enrollmentId),
    }));
    updateSession(day, id, (s) => ({ ...s, available: Math.min(s.capacity, s.available + 1) }));
  };

  const adjustCapacity = (day: string, id: string, delta: number) => {
    updateSession(day, id, (s) => {
      const capacity = Math.max(0, s.capacity + delta);
      // Shift available by the same delta so headcount already booked (capacity - available)
      // stays constant — adding a spot opens a spot, it doesn't retroactively book someone.
      const available = Math.max(0, Math.min(capacity, s.available + delta));
      return { ...s, capacity, available };
    });
  };

  const adjustAvailable = (day: string, id: string, delta: number) => {
    updateSession(day, id, (s) => ({
      ...s,
      available: Math.min(s.capacity, Math.max(0, s.available + delta)),
    }));
  };

  const updateRosterEntry = (
    sessionId: string,
    entryId: string,
    updater: (entry: RosterEntry) => RosterEntry
  ) => {
    setRosterBySession((prev) => ({
      ...prev,
      [sessionId]: (prev[sessionId] ?? []).map((e) => (e.id !== entryId ? e : updater(e))),
    }));
  };

  const toggleCheckIn = (sessionId: string, entryId: string) => {
    updateRosterEntry(sessionId, entryId, (e) => ({
      ...e,
      checkedIn: !e.checkedIn,
      // Checking in deducts a strip; undoing a check-in refunds it.
      strips: e.strips + (e.checkedIn ? 1 : -1),
    }));
  };

  const adjustStrip = (sessionId: string, entryId: string, delta: number) => {
    updateRosterEntry(sessionId, entryId, (e) => ({ ...e, strips: Math.max(0, e.strips + delta) }));
  };

  return (
    <ScheduleContext.Provider
      value={{
        days,
        rosterBySession,
        requests,
        enrollmentsBySession,
        hasRequested,
        bookSession,
        resolveRequest,
        addEnrollment,
        removeEnrollment,
        adjustCapacity,
        adjustAvailable,
        toggleCheckIn,
        adjustStrip,
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
