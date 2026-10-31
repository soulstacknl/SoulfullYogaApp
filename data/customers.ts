// ~100 generated demo customers, each with one standing lesson, spread evenly
// over the weekly schedule. Deterministic, so every reload shows the same data.
import { initialSessions } from '@/data/schedule';
import type { MockUser } from '@/data/users';

// Small seeded PRNG (mulberry32): same sequence for the same seed.
export function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = ['Anna', 'Sanne', 'Lotte', 'Femke', 'Iris', 'Noor', 'Eva', 'Lisa', 'Julia', 'Fleur', 'Sophie', 'Emma', 'Tessa', 'Roos', 'Maud', 'Nina', 'Vera', 'Elke', 'Carla', 'Marloes', 'Yara', 'Britt', 'Esmee', 'Amber', 'Wendy', 'Suzanne', 'Karin', 'Nadia', 'Ingrid', 'Manon', 'Merel', 'Loes', 'Petra', 'Anouk', 'Ilse', 'Mirjam', 'Hanneke', 'Joyce', 'Linda', 'Monique', 'Sandra', 'Esther', 'Inge', 'Marjan', 'Ellen', 'Bram', 'Joost', 'Thijs', 'Ruben', 'Hans', 'Peter', 'Mark', 'Jeroen', 'Koen', 'Wouter', 'Sander', 'Gijs', 'Lieke', 'Kim', 'Eline', 'Floor', 'Jet', 'Puck', 'Mila', 'Saskia', 'Annemiek', 'Gerda', 'Ria', 'Tineke', 'Willemijn'];
const LAST_NAMES = ['Jansen', 'de Vries', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'de Graaf', 'van der Meer', 'Kok', 'Jacobs', 'Willems', 'van den Berg', 'Verhoeven', 'Schouten', 'Hoekstra', 'Kuiper', 'Postma', 'Timmer', 'van Beek', 'Kramer', 'Sanders', 'Groen', 'Blom', 'Peeters', 'Aarts', 'Verweij', 'van Erp', 'Coolen', 'van Lith', 'Hermans', 'van Rooij', 'Verbeek', 'Kuijpers', 'van Gerwen', 'Wijnen', 'Cornelissen'];

// Total standing customers, including the hand-written accounts in data/users.ts.
const TOTAL = 100;
// Standing lessons of the hand-written accounts; they take a spot from the pool.
const FIXED: Record<string, string> = {
  'marieke@soulfulyoga.nl': 'tue-1',
  'marjolijn_n@hotmail.com': 'thu-2',
  'daan@soulfulyoga.nl': 'fri-2',
};

// A standing lesson to seed: started `pastWeeks` lessons ago, some of those cancelled.
export type StandingSeed = { email: string; sessionId: string; pastWeeks: number; cancelledWeeks: number[]; weeks: number };

function generate(reservedNames: string[]) {
  const rnd = seededRandom(20261031);
  const pick = <T,>(list: T[]) => list[Math.floor(rnd() * list.length)];

  // Every session gets (capacity − 1) standing customers per round until there are enough.
  const slots: string[] = [];
  for (let round = 0; slots.length < TOTAL; round++) {
    for (const s of initialSessions) {
      if (slots.length < TOTAL && round < s.capacity - 1) slots.push(s.id);
    }
  }
  for (const sessionId of Object.values(FIXED)) slots.splice(slots.indexOf(sessionId), 1);
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  const used = new Set(reservedNames);
  const users: MockUser[] = [];
  const standing: StandingSeed[] = [];
  for (const sessionId of slots) {
    let name: string;
    do name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    while (used.has(name));
    used.add(name);
    const email = `${name.toLowerCase().replace(/ /g, '.')}@voorbeeld.nl`;
    const r = rnd();
    // ~5% without a card, ~7% with none left
    const strippen = r < 0.05 ? null : r < 0.12 ? 0 : Math.floor(rnd() * 10) + 1;
    users.push({
      email,
      password: 'yoga123',
      name,
      phone: `06 ${String(Math.floor(rnd() * 1e8)).padStart(8, '0')}`,
      strippen,
      total: 10,
      role: 'student',
      termsAcceptedAt: rnd() < 0.6 ? `${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}-10-2026` : null,
    });
    const pastWeeks = 1 + Math.floor(rnd() * 4);
    standing.push({
      email,
      sessionId,
      pastWeeks,
      cancelledWeeks: rnd() < 0.15 ? [Math.floor(rnd() * pastWeeks)] : [],
      weeks: rnd() < 0.8 ? 99 : 12 + Math.floor(rnd() * 13),
    });
  }
  return { users, standing };
}

const generated = generate(['Marieke Jansen', 'Daan de Vries', 'Studio Beheer', 'Marjolijn N.']);

export const demoCustomers: MockUser[] = generated.users;

// Hand-written accounts first (balances in data/users.ts match their history).
export const standingSeeds: StandingSeed[] = [
  { email: 'marieke@soulfulyoga.nl', sessionId: 'tue-1', pastWeeks: 4, cancelledWeeks: [1], weeks: 99 },
  { email: 'marjolijn_n@hotmail.com', sessionId: 'thu-2', pastWeeks: 3, cancelledWeeks: [], weeks: 12 },
  { email: 'daan@soulfulyoga.nl', sessionId: 'fri-2', pastWeeks: 2, cancelledWeeks: [], weeks: 99 },
  ...generated.standing,
];
