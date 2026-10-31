// Regular attendees without an app account, per weekly session — stands in for
// the `bookings` + `users` join until Supabase is connected. They count toward
// every week's occupancy and show up on the Docentmodus attendance list.
export type RosterEntry = {
  id: string;
  name: string;
  strips: number;
};

const seed: Record<string, [name: string, strips: number][]> = {
  'mon-1': [
    ['Lotte Jansen', 4],
    ['Femke van Dijk', 2],
  ],
  'mon-2': [
    ['Marieke de Groot', 3],
    ['Sanne Verhoeven', 0],
    ['Petra Willems', 6],
    ['Anouk Bakker', 1],
    ['Noor Bos', 5],
    ['Eva de Wit', 2],
    ['Tessa Mulder', 0],
  ],
  'tue-1': [
    ['Iris Vermeulen', 3],
    ['Sophie de Boer', 7],
    ['Julia Hendriks', 1],
    ['Fleur Dekker', 4],
    ['Lisa Kok', 2],
  ],
  'wed-1': [
    ['Maud Willemsen', 5],
    ['Roos Meijer', 0],
    ['Nina Kuiper', 3],
    ['Vera Postma', 8],
    ['Anna Brouwer', 2],
    ['Elke Visser', 1],
    ['Carla Smeets', 6],
    ['Marloes Timmer', 4],
    ['Yara van Beek', 0],
    ['Britt Kramer', 3],
    ['Esmee Sanders', 5],
    ['Amber Groen', 2],
  ],
  'thu-1': [],
  'thu-2': [
    ['Wendy Hoekstra', 4],
    ['Suzanne Blom', 1],
    ['Karin Dijkstra', 6],
    ['Nadia Peeters', 2],
  ],
  'fri-1': [
    ['Hans Peters', 4],
    ['Ingrid Smit', 2],
    ['Manon Verheul', 0],
    ['Merel Aarts', 5],
  ],
  'fri-2': [['Loes Verweij', 3]],
};

export const initialRoster: Record<string, RosterEntry[]> = Object.fromEntries(
  Object.entries(seed).map(([sessionId, entries]) => [
    sessionId,
    entries.map(([name, strips], i) => ({ id: `${sessionId}-${i + 1}`, name, strips })),
  ])
);
