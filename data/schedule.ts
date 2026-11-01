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

export const classDescriptions: Record<ClassStyle, string> = {
  yin: 'Een zeer rustige, ontspannen en mindful vorm van yoga. Je houdt posities vast voor 3 tot 5 minuten, wat spieren, bindweefsel en fascia de tijd geeft om mee te komen in de rek. Je ervaart diepe rust en stilte.',
  flow: 'Met Flow Yoga laat je je meevoeren met de muziek — elke in- en uitademing wordt een beweging, tot er een soort yogadans ontstaat. De les wordt een maand lang herhaald zodat je volledig zonder nadenken in de Flow komt.',
  gentle: 'Een milde vorm van yoga waarin je met aandacht beweegt, diep ademhaalt en het lichaam souplesse geeft. De houdingen zijn voor iedereen goed te volgen en aan te passen waar nodig.',
};
