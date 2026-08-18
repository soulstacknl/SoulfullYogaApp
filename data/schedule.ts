import type { ClassStyle } from '@/constants/theme';

export type ClassSession = {
  id: string;
  style: ClassStyle;
  time: string; // display format, e.g. "19.00 – 20.00"
  capacity: number;
  available: number;
};

export type DaySchedule = {
  day: string;
  classes: ClassSession[];
};

// Matches the real weekly schedule from soulful-yoga-app-spec.md
export const schedule: DaySchedule[] = [
  {
    day: 'Maandag',
    classes: [
      { id: 'mon-1', style: 'yin', time: '19.00 – 20.00', capacity: 10, available: 8 },
      { id: 'mon-2', style: 'yin', time: '20.15 – 21.15', capacity: 10, available: 3 },
    ],
  },
  {
    day: 'Dinsdag',
    classes: [{ id: 'tue-1', style: 'yin', time: '19.00 – 20.00', capacity: 10, available: 5 }],
  },
  {
    day: 'Woensdag',
    classes: [{ id: 'wed-1', style: 'flow', time: '09.00 – 10.00', capacity: 12, available: 0 }],
  },
  {
    day: 'Donderdag',
    classes: [
      { id: 'thu-1', style: 'yin', time: '19.00 – 20.00', capacity: 10, available: 10 },
      { id: 'thu-2', style: 'yin', time: '20.15 – 21.15', capacity: 10, available: 6 },
    ],
  },
  {
    day: 'Vrijdag',
    classes: [
      { id: 'fri-1', style: 'gentle', time: '09.00 – 10.00', capacity: 8, available: 4 },
      { id: 'fri-2', style: 'yin', time: '10.15 – 11.15', capacity: 10, available: 9 },
    ],
  },
];

export const classDescriptions: Record<ClassStyle, string> = {
  yin: 'Een zeer rustige, ontspannen en mindful vorm van yoga. Je houdt posities vast voor 3 tot 5 minuten, wat spieren, bindweefsel en fascia de tijd geeft om mee te komen in de rek. Je ervaart diepe rust en stilte.',
  flow: 'Met Flow Yoga laat je je meevoeren met de muziek — elke in- en uitademing wordt een beweging, tot er een soort yogadans ontstaat. De les wordt een maand lang herhaald zodat je volledig zonder nadenken in de Flow komt.',
  gentle: 'Een milde vorm van yoga waarin je met aandacht beweegt, diep ademhaalt en het lichaam souplesse geeft. De houdingen zijn voor iedereen goed te volgen en aan te passen waar nodig.',
};
