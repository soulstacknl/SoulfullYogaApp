import { Pressable, StyleSheet, Text, View } from 'react-native';

import CardValidity from '@/components/CardValidity';
import { colors, fonts } from '@/constants/theme';
import type { AppUser } from '@/data/users';

type UserStripRowProps = {
  user: AppUser;
  detail?: string;
  today: string; // for the card's validity
  onActivateCard?: () => void;
  onAdjust: (delta: number) => void;
  // Tapping the name opens the customer's details.
  onOpen?: () => void;
};

// Initials coloured by how the customer came in: green = account request, yellow = added by hand.
const ORIGIN_COLORS = {
  aanvraag: { backgroundColor: '#EAF3EE', color: colors.teal },
  beheer: { backgroundColor: '#FCF1DE', color: '#9A6512' },
};

function initialsFor(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function UserStripRow({ user, detail, today, onActivateCard, onAdjust, onOpen }: UserStripRowProps) {
  const tint = ORIGIN_COLORS[user.origin];
  const strips = user.strippen ?? 0;

  return (
    <View style={styles.row}>
      <Pressable style={styles.open} onPress={onOpen} disabled={!onOpen}>
        <View style={[styles.initials, { backgroundColor: tint.backgroundColor }]}>
          <Text style={[styles.initialsText, { color: tint.color }]}>{initialsFor(user.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.strip}>
            {user.strippen === null ? 'geen kaart' : `${strips} ${strips === 1 ? 'strip' : 'strippen'}`}
            {detail ? ` · ${detail}` : ''}
          </Text>
          {user.strippen !== null ? <CardValidity validUntil={user.stripsValidUntil} today={today} style={styles.validity} /> : null}
        </View>
      </Pressable>

      <View style={styles.stripAdjust}>
        <Pressable style={styles.adjustBtn} onPress={() => onAdjust(-1)} hitSlop={10}>
          <Text style={styles.adjustBtnText}>–</Text>
        </Pressable>
        <Pressable style={styles.adjustBtn} onPress={() => onAdjust(1)} hitSlop={10}>
          <Text style={styles.adjustBtnText}>+</Text>
        </Pressable>
        {onActivateCard ? (
          <Pressable style={styles.cardBtn} onPress={onActivateCard} hitSlop={6}>
            <Text style={styles.cardBtnText}>+10</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  validity: {
    marginTop: 3,
    fontSize: 10.5,
    paddingVertical: 1,
    paddingHorizontal: 7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 12,
    marginBottom: 9,
  },
  open: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initials: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  strip: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 1,
  },
  stripAdjust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBtn: {
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.teal,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: '#fff',
  },
  adjustBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 18,
  },
});
