import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, styleMeta } from '@/constants/theme';
import type { ClassSession } from '@/data/schedule';

type AdminClassCardProps = {
  session: ClassSession;
  onPress: (session: ClassSession) => void;
};

export default function AdminClassCard({ session, onPress }: AdminClassCardProps) {
  const meta = styleMeta[session.style];
  const booked = session.capacity - session.available;
  const isFull = booked >= session.capacity;

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
      <View style={[styles.pill, isFull && styles.pillFull]}>
        <Text style={styles.pillText}>
          {booked} / {session.capacity}
        </Text>
      </View>
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
    borderWidth: 2,
    borderColor: colors.sand,
    padding: 16,
    marginBottom: 12,
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
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 1,
  },
  pill: {
    backgroundColor: colors.teal,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillFull: {
    backgroundColor: colors.rani,
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: '#fff',
  },
});
