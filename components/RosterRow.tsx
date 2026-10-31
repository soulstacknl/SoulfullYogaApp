import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type RosterRowProps = {
  name: string;
  strips: number;
  checkedIn: boolean;
  usesApp: boolean; // app customers pay automatically after the lesson
  onToggleCheckIn: () => void;
  onAdjustStrip: (delta: number) => void;
};

function initialsFor(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function RosterRow({ name, strips, checkedIn, usesApp, onToggleCheckIn, onAdjustStrip }: RosterRowProps) {
  return (
    <View style={[styles.row, checkedIn && styles.rowChecked]}>
      <Pressable
        style={[styles.checkinBtn, checkedIn && styles.checkinBtnChecked]}
        onPress={onToggleCheckIn}
        hitSlop={10}>
        {checkedIn ? <Text style={styles.checkmark}>✓</Text> : null}
      </Pressable>

      <View style={styles.initials}>
        <Text style={styles.initialsText}>{initialsFor(name)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{name}
          {usesApp ? ' 📱' : ''}
        </Text>
        <Text style={styles.strip}>{strips} lessen over</Text>
      </View>

      <View style={styles.stripAdjust}>
        <Pressable style={styles.adjustBtn} onPress={() => onAdjustStrip(-1)} hitSlop={10}>
          <Text style={styles.adjustBtnText}>–</Text>
        </Pressable>
        <Pressable style={styles.adjustBtn} onPress={() => onAdjustStrip(1)} hitSlop={10}>
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
  rowChecked: {
    backgroundColor: '#EAF3EE',
    borderColor: colors.teal,
  },
  checkinBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.sand,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinBtnChecked: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.bodyBold,
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
