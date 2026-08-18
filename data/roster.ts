// Mock per-class booking rosters — stands in for the `bookings` + `users` join
// until Supabase is connected. Counts here match capacity - available for the
// corresponding session in data/schedule.ts.
export type RosterEntry = {
  id: string;
  name: string;
  strips: number;
  checkedIn: boolean;
};

export const rosterBySession: Record<string, RosterEntry[]> = {
  'mon-1': [
    { id: 'mon-1-1', name: 'Lotte Jansen', strips: 4, checkedIn: false },
    { id: 'mon-1-2', name: 'Femke van Dijk', strips: 2, checkedIn: true },
  ],
  'mon-2': [
    { id: 'mon-2-1', name: 'Marieke de Groot', strips: 3, checkedIn: true },
    { id: 'mon-2-2', name: 'Sanne Verhoeven', strips: 0, checkedIn: false },
    { id: 'mon-2-3', name: 'Petra Willems', strips: 6, checkedIn: true },
    { id: 'mon-2-4', name: 'Anouk Bakker', strips: 1, checkedIn: false },
    { id: 'mon-2-5', name: 'Noor Bos', strips: 5, checkedIn: false },
    { id: 'mon-2-6', name: 'Eva de Wit', strips: 2, checkedIn: true },
    { id: 'mon-2-7', name: 'Tessa Mulder', strips: 0, checkedIn: false },
  ],
  'tue-1': [
    { id: 'tue-1-1', name: 'Iris Vermeulen', strips: 3, checkedIn: false },
    { id: 'tue-1-2', name: 'Sophie de Boer', strips: 7, checkedIn: true },
    { id: 'tue-1-3', name: 'Julia Hendriks', strips: 1, checkedIn: false },
    { id: 'tue-1-4', name: 'Fleur Dekker', strips: 4, checkedIn: true },
    { id: 'tue-1-5', name: 'Lisa Kok', strips: 2, checkedIn: false },
  ],
  'wed-1': [
    { id: 'wed-1-1', name: 'Maud Willemsen', strips: 5, checkedIn: true },
    { id: 'wed-1-2', name: 'Roos Meijer', strips: 0, checkedIn: false },
    { id: 'wed-1-3', name: 'Nina Kuiper', strips: 3, checkedIn: true },
    { id: 'wed-1-4', name: 'Vera Postma', strips: 8, checkedIn: false },
    { id: 'wed-1-5', name: 'Anna Brouwer', strips: 2, checkedIn: true },
    { id: 'wed-1-6', name: 'Elke Visser', strips: 1, checkedIn: false },
    { id: 'wed-1-7', name: 'Carla Smeets', strips: 6, checkedIn: true },
    { id: 'wed-1-8', name: 'Marloes Timmer', strips: 4, checkedIn: false },
    { id: 'wed-1-9', name: 'Yara van Beek', strips: 0, checkedIn: false },
    { id: 'wed-1-10', name: 'Britt Kramer', strips: 3, checkedIn: true },
    { id: 'wed-1-11', name: 'Esmee Sanders', strips: 5, checkedIn: false },
    { id: 'wed-1-12', name: 'Amber Groen', strips: 2, checkedIn: true },
  ],
  'thu-1': [],
  'thu-2': [
    { id: 'thu-2-1', name: 'Wendy Hoekstra', strips: 4, checkedIn: false },
    { id: 'thu-2-2', name: 'Suzanne Blom', strips: 1, checkedIn: true },
    { id: 'thu-2-3', name: 'Karin Dijkstra', strips: 6, checkedIn: false },
    { id: 'thu-2-4', name: 'Nadia Peeters', strips: 2, checkedIn: true },
  ],
  'fri-1': [
    { id: 'fri-1-1', name: 'Hans Peters', strips: 4, checkedIn: false },
    { id: 'fri-1-2', name: 'Ingrid Smit', strips: 2, checkedIn: true },
    { id: 'fri-1-3', name: 'Manon Verheul', strips: 0, checkedIn: false },
    { id: 'fri-1-4', name: 'Merel Aarts', strips: 5, checkedIn: true },
  ],
  'fri-2': [{ id: 'fri-2-1', name: 'Loes Verweij', strips: 3, checkedIn: false }],
};
