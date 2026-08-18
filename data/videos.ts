import type { ClassStyle } from '@/constants/theme';

export type Video = {
  id: string;
  title: string;
  style: ClassStyle;
  durationMinutes: number;
  level: string;
};

// Static mock data matching soulful-yoga-app-prototype.html
export const videos: Video[] = [
  {
    id: 'v1',
    title: 'Yin Yoga — diepe ontspanning',
    style: 'yin',
    durationMinutes: 45,
    level: 'alle niveaus',
  },
  {
    id: 'v2',
    title: 'Flow Yoga — vloeiende beweging',
    style: 'flow',
    durationMinutes: 50,
    level: 'gevorderd',
  },
  {
    id: 'v3',
    title: 'Gentle Yoga — zachte start',
    style: 'gentle',
    durationMinutes: 30,
    level: 'beginners',
  },
  {
    id: 'v4',
    title: 'Yin Yoga — lage rug & heupen',
    style: 'yin',
    durationMinutes: 40,
    level: 'alle niveaus',
  },
];
