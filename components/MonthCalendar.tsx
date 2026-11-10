import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, styleMeta } from '@/constants/theme';
import type { ClassStyle } from '@/constants/theme';
import { isoOf } from '@/lib/dutchDate';

const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

// A dot is a group lesson (its style) or, for the admin, a private lesson.
export type CalendarMark = ClassStyle | 'prive';
const markColor = (m: CalendarMark) => (m === 'prive' ? colors.plum : styleMeta[m].color);
const markLabel = (m: CalendarMark) => (m === 'prive' ? 'Privéles' : styleMeta[m].label);
const MARKS: CalendarMark[] = [...(Object.keys(styleMeta) as ClassStyle[]), 'prive'];

type MonthCalendarProps = {
  first: Date; // first day of the month shown
  today: string;
  // The lessons on a date (one dot each, in the lesson's colour).
  lessonsOn: (date: string) => CalendarMark[];
  onSelect: (date: string) => void;
};

// Month overview above the schedule: Monday-first grid, a dot per lesson,
// past days faded. Tapping a day with lessons jumps to it in the list below.
export default function MonthCalendar({ first, today, lessonsOn, onSelect }: MonthCalendarProps) {
  const lead = (first.getDay() + 6) % 7; // empty cells before the 1st (Monday = 0)
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => isoOf(new Date(first.getFullYear(), first.getMonth(), i + 1))),
  ];
  while (cells.length % 7) cells.push(null);
  const used = MARKS.filter((s) => cells.some((d) => d && lessonsOn(d).includes(s)));

  return (
    <View style={styles.card}>
      <View style={styles.week}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, w) => (
        <View key={w} style={styles.week}>
          {cells.slice(w * 7, w * 7 + 7).map((date, i) => {
            if (!date) return <View key={i} style={styles.cell} />;
            const lessons = lessonsOn(date);
            const past = date < today;
            return (
              <Pressable
                key={date}
                style={[styles.cell, date === today && styles.today]}
                onPress={() => onSelect(date)}
                disabled={past || lessons.length === 0}
                accessibilityLabel={`${Number(date.slice(8))} ${lessons.length ? `${lessons.length} ${lessons.length === 1 ? 'les' : 'lessen'}` : 'geen les'}`}>
                <Text style={[styles.num, past && styles.past, lessons.length > 0 && !past && styles.numLesson]}>{Number(date.slice(8))}</Text>
                <View style={styles.dots}>
                  {lessons.slice(0, 4).map((s, k) => (
                    <View key={k} style={[styles.dot, { backgroundColor: markColor(s) }, past && { opacity: 0.35 }]} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
      {used.length ? (
        <View style={styles.legend}>
          {used.map((s) => (
            <View key={s} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: markColor(s) }]} />
              <Text style={styles.legendText}>{markLabel(s)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 8, marginTop: 14 },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.mutedText, textTransform: 'uppercase', marginBottom: 4 },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: 12, minHeight: 40 },
  today: { backgroundColor: '#E9EEDF' },
  num: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  numLesson: { fontFamily: fonts.bodySemiBold },
  past: { color: '#BACDC0' },
  dots: { flexDirection: 'row', gap: 3, marginTop: 3, height: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1EADC' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontFamily: fonts.body, fontSize: 11.5, color: colors.mutedText },
});
