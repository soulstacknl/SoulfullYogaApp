// Design tokens taken directly from soulful-yoga-app-prototype.html
export const colors = {
  ivory: '#FBF5EA', // background
  ink: '#1F3D2B', // forest green — primary / nav / text
  marigold: '#E8A33D', // accent — Gentle Yoga
  rani: '#C23B6E', // accent — Flow Yoga / primary CTA
  teal: '#1C6B5E', // accent — Yin Yoga
  plum: '#6E4B8F', // private lessons
  sand: '#E3D5BE', // borders / lines
  card: '#FFFFFF',
  stageBg: '#EDE6D8',
  mutedText: '#6E7A70',
  descText: '#3D4F43',
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_500Medium_Italic',
  body: 'WorkSans_400Regular',
  bodyMedium: 'WorkSans_500Medium',
  bodySemiBold: 'WorkSans_600SemiBold',
  bodyBold: 'WorkSans_700Bold',
} as const;

export const radii = {
  sm: 12,
  md: 14,
  lg: 18,
  xl: 20,
  xxl: 26,
} as const;

export type ClassStyle = 'yin' | 'flow' | 'gentle';

export const styleMeta: Record<
  ClassStyle,
  { label: string; dotLabel: string; color: string }
> = {
  yin: { label: 'Yin Yoga', dotLabel: 'Yin', color: colors.teal },
  flow: { label: 'Flow Yoga', dotLabel: 'Flow', color: colors.rani },
  gentle: { label: 'Gentle Yoga', dotLabel: 'Gtl', color: colors.marigold },
};
