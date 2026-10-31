import { StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export type TagTone = 'teal' | 'ink' | 'pending' | 'muted' | 'rani';

const tones: Record<TagTone, { backgroundColor: string; color: string }> = {
  teal: { backgroundColor: '#EAF3EE', color: colors.teal },
  ink: { backgroundColor: '#E9EEDF', color: colors.ink },
  pending: { backgroundColor: '#FCF1DE', color: '#9A6512' },
  muted: { backgroundColor: '#EFE8DC', color: colors.mutedText },
  rani: { backgroundColor: '#FBE7EE', color: colors.rani },
};

// Small status pill, e.g. "Vaste les" or "Afgemeld · telt niet mee".
export default function Tag({ label, tone, style }: { label: string; tone: TagTone; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.tag, tones[tone], style]}>{label}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 4,
  },
});
