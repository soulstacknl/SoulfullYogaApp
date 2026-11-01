import type { ClassStyle } from '@/constants/theme';

export type Video = {
  id: string;
  title: string;
  style: ClassStyle;
  durationMinutes: number;
  level: string;
};

// Empty in the first versions: the Video's tab shows a "coming soon" message
// until real videos are added here (later from Supabase).
export const videos: Video[] = [];
