import type { ClassStyle } from '@/constants/theme';

export type Video = {
  id: string;
  title: string;
  style: ClassStyle;
  durationMinutes: number;
  level: string;
};

// Empty in the first versions: the Video's tab says videos and media files will be shared there
// until real videos are added here (later from Supabase).
export const videos: Video[] = [];
