import { Pressable, StyleSheet, Text, View } from 'react-native';

import Tag from '@/components/Tag';
import { colors, fonts, styleMeta } from '@/constants/theme';
import type { Session } from '@/data/schedule';

export type SpotsTone = 'muted' | 'full' | 'mine' | 'pending';

type ClassCardProps = {
  session: Session;
  spotsText: string;
  spotsTone: SpotsTone;
  closedReason?: string;
  extra?: boolean;
  onPress: () => void;
};

const spotsColor: Record<SpotsTone, string> = {
  muted: colors.mutedText,
  full: colors.rani,
  mine: colors.teal,
  pending: '#B07A1E',
};

export default function ClassCard({ session, spotsText, spotsTone, closedReason, extra, onPress }: ClassCardProps) {
  const meta = styleMeta[session.style];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, closedReason && styles.cardClosed, pressed && styles.cardPressed]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]}>
        <Text style={styles.dotLabel}>{meta.dotLabel}</Text>
      </View>
      <View style={styles.meta}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{meta.label}</Text>
          {extra ? <Tag label="Extra" tone="pending" style={styles.extraTag} /> : null}
        </View>
        <Text style={styles.time}>
          {session.time}
          {closedReason ? ` · ${closedReason}` : ''}
        </Text>
      </View>
      <Text style={[styles.spots, { color: spotsColor[spotsTone] }]}>{spotsText}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

// A private lesson in the admin's timetable: only the admin sees these.
export function PrivateClassCard({ name, time, onPress }: { name: string; time: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={[styles.dot, { backgroundColor: colors.plum }]}>
        <Text style={styles.dotLabel}>P</Text>
      </View>
      <View style={styles.meta}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>Privéles</Text>
          <Tag label={name} tone="rani" style={styles.extraTag} />
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  extraTag: {
    marginTop: 0,
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
    marginRight: 2,
  },
  chevron: {
    fontSize: 22,
    color: colors.sand,
  },
});
