// Regular attendees without an app account, per weekly session — stands in for
// the `bookings` + `users` join until Supabase is connected. They count toward
// every week's occupancy and show up on the Docentmodus attendance list.
export type RosterEntry = {
  id: string;
  name: string;
  strips: number;
};

// Empty for now: every demo customer has the app (see data/customers.ts).
const seed: Record<string, [name: string, strips: number][]> = {};

export const initialRoster: Record<string, RosterEntry[]> = Object.fromEntries(
  Object.entries(seed).map(([sessionId, entries]) => [
    sessionId,
    entries.map(([name, strips], i) => ({ id: `${sessionId}-${i + 1}`, name, strips })),
  ])
);
