import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type RosterRowProps = {
  name: string;
  usesApp: boolean;
  present: boolean;
  detail: string;
  onTogglePresent?: () => void; // omitted once the list is confirmed
  onRemove?: () => void; // only for people the admin added
};

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter((w) => /^\p{L}/u.test(w))
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// One attendee on the attendance list: present/absent toggle, name and status line.
export default function RosterRow({ name, usesApp, present, detail, onTogglePresent, onRemove }: RosterRowProps) {
  return (
    <View style={[styles.row, present && styles.rowChecked, !onTogglePresent && !present && styles.rowAbsent]}>
      {onTogglePresent ? (
        <Pressable
          style={[styles.checkinBtn, present && styles.checkinBtnChecked]}
          onPress={onTogglePresent}
          hitSlop={10}>
          {present ? <Text style={styles.checkmark}>✓</Text> : null}
        </Pressable>
      ) : null}
      <View style={styles.initials}>
        <Text style={styles.initialsText}>{initialsFor(name)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {name}
          {usesApp ? ' 📱' : ''}
        </Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      {onRemove ? (
        <Pressable style={styles.removeBtn} onPress={onRemove} hitSlop={10}>
          <Text style={styles.removeBtnText}>✕</Text>
        </Pressable>
      ) : null}
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
  rowAbsent: {
    opacity: 0.55,
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
  detail: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 1,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.rani,
  },
});
