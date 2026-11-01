// Regular attendee without an app account for one weekly session (roster_entries
// in Supabase). They count toward occupancy and show up on the attendance list.
export type RosterEntry = {
  id: string;
  name: string;
  strips: number;
};
