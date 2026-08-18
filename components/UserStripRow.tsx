import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { MockUser } from '@/data/users';

type UserStripRowProps = {
  user: MockUser;
  onAdjust: (delta: number) => void;
};

function initialsFor(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function UserStripRow({ user, onAdjust }: UserStripRowProps) {
  const strips = user.strippen ?? 0;

  return (
    <View style={styles.row}>
      <View style={styles.initials}>
        <Text style={styles.initialsText}>{initialsFor(user.name)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.strip}>{strips} lessen over</Text>
      </View>

      <View style={styles.stripAdjust}>
        <Pressable style={styles.adjustBtn} onPress={() => onAdjust(-1)} hitSlop={10}>
          <Text style={styles.adjustBtnText}>–</Text>
        </Pressable>
        <Pressable style={styles.adjustBtn} onPress={() => onAdjust(1)} hitSlop={10}>
          <Text style={styles.adjustBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  adjustBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 18,
  },
});
