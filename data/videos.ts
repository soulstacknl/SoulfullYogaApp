import type { ClassStyle } from '@/constants/theme';

export type Video = {
  id: string;
  title: string;
  style: ClassStyle;
  durationMinutes: number;
  level: string;
};

// Videos for the Inspiratie tab (later from Supabase). Empty for now: the tab shows the Yin challenge.
export const videos: Video[] = [];
