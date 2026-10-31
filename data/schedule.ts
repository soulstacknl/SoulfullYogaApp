import type { ClassStyle } from '@/constants/theme';

// A lesson slot in the weekly schedule. `from`/`until` (ISO dates, inclusive)
// bound when it runs; a one-off extra lesson has from === until.
export type Session = {
  id: string;
  day: string;
  style: ClassStyle;
  time: string; // display format, e.g. "19.00 – 20.00"
  capacity: number;
  from: string | null;
  until: string | null;
};

// Matches the real weekly schedule from soulful-yoga-app-spec.md
export const initialSessions: Session[] = [
  { id: 'mon-1', day: 'Maandag', style: 'yin', time: '19.00 – 20.00', capacity: 10, from: null, until: null },
  { id: 'mon-2', day: 'Maandag', style: 'yin', time: '20.15 – 21.15', capacity: 10, from: null, until: null },
  { id: 'tue-1', day: 'Dinsdag', style: 'yin', time: '19.00 – 20.00', capacity: 10, from: null, until: null },
  { id: 'wed-1', day: 'Woensdag', style: 'flow', time: '09.00 – 10.00', capacity: 12, from: null, until: null },
  { id: 'thu-1', day: 'Donderdag', style: 'yin', time: '19.00 – 20.00', capacity: 10, from: null, until: null },
  { id: 'thu-2', day: 'Donderdag', style: 'yin', time: '20.15 – 21.15', capacity: 10, from: null, until: null },
  { id: 'fri-1', day: 'Vrijdag', style: 'gentle', time: '09.00 – 10.00', capacity: 8, from: null, until: null },
  { id: 'fri-2', day: 'Vrijdag', style: 'yin', time: '10.15 – 11.15', capacity: 10, from: null, until: null },
];

export const classDescriptions: Record<ClassStyle, string> = {
  yin: 'Een zeer rustige, ontspannen en mindful vorm van yoga. Je houdt posities vast voor 3 tot 5 minuten, wat spieren, bindweefsel en fascia de tijd geeft om mee te komen in de rek. Je ervaart diepe rust en stilte.',
  flow: 'Met Flow Yoga laat je je meevoeren met de muziek — elke in- en uitademing wordt een beweging, tot er een soort yogadans ontstaat. De les wordt een maand lang herhaald zodat je volledig zonder nadenken in de Flow komt.',
  gentle: 'Een milde vorm van yoga waarin je met aandacht beweegt, diep ademhaalt en het lichaam souplesse geeft. De houdingen zijn voor iedereen goed te volgen en aan te passen waar nodig.',
};
