import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { dateLabel, plusDays } from '@/lib/dutchDate';

// Dependency-free date/time pickers for the admin forms: arrow buttons step
// through the values, which works the same on iOS, Android and web.

type DateFieldProps = {
  label: string;
  value: string | null; // ISO date
  onChange: (value: string | null) => void;
  // Optional fields can be cleared ("Geen einddatum") and started from `fallback`.
  optional?: { emptyLabel: string; fallback: string };
};

export function DateField({ label, value, onChange, optional }: DateFieldProps) {
  const step = (days: number) => value && onChange(plusDays(value, days));
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      {value ? (
        <View style={styles.box}>
          <Arrow text="«" onPress={() => step(-7)} />
          <Arrow text="‹" onPress={() => step(-1)} />
          <Text style={styles.value} numberOfLines={1}>
            {dateLabel(value)}
          </Text>
          <Arrow text="›" onPress={() => step(1)} />
          <Arrow text="»" onPress={() => step(7)} />
          {optional ? (
            <Pressable onPress={() => onChange(null)} hitSlop={8} style={styles.clear}>
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      ) : optional ? (
        <Pressable style={[styles.box, styles.emptyBox]} onPress={() => onChange(optional.fallback)}>
          <Text style={styles.emptyText}>{optional.emptyLabel}</Text>
          <Text style={styles.addText}>+ Kies datum</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type TimeFieldProps = {
  label: string;
  value: string; // "19.00"
  onChange: (value: string) => void;
};

const STEP_MINUTES = 15;

export function TimeField({ label, value, onChange }: TimeFieldProps) {
  const step = (direction: number) => {
    const [h, m] = value.split('.').map(Number);
    const total = (h * 60 + m + direction * STEP_MINUTES + 24 * 60) % (24 * 60);
    onChange(`${String(Math.floor(total / 60)).padStart(2, '0')}.${String(total % 60).padStart(2, '0')}`);
  };
  return (
    <View style={[styles.wrapper, styles.timeWrapper]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Arrow text="‹" onPress={() => step(-1)} />
        <Text style={styles.value}>{value}</Text>
        <Arrow text="›" onPress={() => step(1)} />
      </View>
    </View>
  );
}

function Arrow({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable style={styles.arrow} onPress={onPress} hitSlop={4}>
      <Text style={styles.arrowText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  timeWrapper: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
    marginBottom: 6,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  value: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 17,
  },
  clear: {
    marginLeft: 4,
    paddingHorizontal: 4,
  },
  clearText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.rani,
  },
  emptyBox: {
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedText,
  },
  addText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.rani,
  },
});
