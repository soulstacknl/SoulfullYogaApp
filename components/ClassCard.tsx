import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, styleMeta } from '@/constants/theme';
import type { ClassSession } from '@/data/schedule';

type ClassCardProps = {
  session: ClassSession;
  onPress: (session: ClassSession) => void;
};

export default function ClassCard({ session, onPress }: ClassCardProps) {
  const meta = styleMeta[session.style];
  const isFull = session.available <= 0;

  return (
    <Pressable
      onPress={() => onPress(session)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]}>
        <Text style={styles.dotLabel}>{meta.dotLabel}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.name}>{meta.label}</Text>
        <Text style={styles.time}>{session.time}</Text>
      </View>
      <Text style={[styles.spots, isFull && styles.spotsFull]}>
        {isFull ? 'Vol' : `${session.available}/${session.capacity}`}
      </Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.sand,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: '#fff',
  },
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.mutedText,
    marginTop: 1,
  },
  spots: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.mutedText,
    marginRight: 2,
  },
  spotsFull: {
    color: colors.rani,
  },
  chevron: {
    fontSize: 22,
    color: colors.sand,
  },
});
