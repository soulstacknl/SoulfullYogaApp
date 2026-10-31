import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, styleMeta } from '@/constants/theme';
import type { Session } from '@/data/schedule';

type AdminClassCardProps = {
  session: Session;
  booked: number;
  capacity: number;
  closedReason?: string;
  // Attendance state, shown instead of the occupancy once the lesson has started.
  attendance?: 'confirmed' | 'todo';
  dateLabel?: string; // for lessons on another day than today
  onPress?: () => void;
};

export default function AdminClassCard({
  session,
  booked,
  capacity,
  closedReason,
  attendance,
  dateLabel,
  onPress,
}: AdminClassCardProps) {
  const meta = styleMeta[session.style];
  const isFull = booked >= capacity;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, closedReason && styles.cardClosed, pressed && styles.cardPressed]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]}>
        <Text style={styles.dotLabel}>{meta.dotLabel}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.name}>{meta.label}</Text>
        <Text style={styles.time}>
          {dateLabel ? `${dateLabel} · ` : ''}
          {session.time}
          {closedReason ? ` · ${closedReason}` : ''}
        </Text>
      </View>
      <View
        style={[
          styles.pill,
          isFull && styles.pillFull,
          attendance === 'todo' && styles.pillFull,
          attendance === 'confirmed' && styles.pillConfirmed,
          closedReason && styles.pillClosed,
        ]}>
        <Text style={[styles.pillText, closedReason && styles.pillTextClosed]}>
          {closedReason
            ? 'Vervalt'
            : attendance === 'confirmed'
              ? '✓ Bevestigd'
              : attendance === 'todo'
                ? 'Bevestigen'
                : `${booked} / ${capacity}`}
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
  cardClosed: {
    opacity: 0.55,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
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
  pillConfirmed: {
    backgroundColor: colors.teal,
  },
  pillClosed: {
    backgroundColor: colors.sand,
  },
  pillTextClosed: {
    color: colors.ink,
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: '#fff',
  },
});
