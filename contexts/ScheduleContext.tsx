import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import { rosterBySession as initialRoster } from '@/data/roster';
import type { RosterEntry } from '@/data/roster';
import { schedule } from '@/data/schedule';
import type { ClassSession, DaySchedule } from '@/data/schedule';

type ScheduleContextValue = {
  days: DaySchedule[];
  rosterBySession: Record<string, RosterEntry[]>;
  bookSession: (day: string, id: string) => boolean;
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

  const updateSession = (day: string, id: string, updater: (session: ClassSession) => ClassSession) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day !== day ? d : { ...d, classes: d.classes.map((c) => (c.id !== id ? c : updater(c))) }
      )
    );
  };

  const bookSession = (day: string, id: string) => {
    const session = days.find((d) => d.day === day)?.classes.find((c) => c.id === id);
    if (!session || session.available <= 0) return false;
    updateSession(day, id, (s) => ({ ...s, available: Math.max(0, s.available - 1) }));
    return true;
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
        bookSession,
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
