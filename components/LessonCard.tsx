import { Pressable, StyleSheet, Text, View } from 'react-native';

import Tag from '@/components/Tag';
import type { TagTone } from '@/components/Tag';
import { colors, fonts, styleMeta } from '@/constants/theme';
import type { Lesson } from '@/contexts/ScheduleContext';
import { toDate, WEEKDAYS } from '@/lib/dutchDate';

type LessonCardProps = {
  lesson: Lesson;
  tag: { label: string; tone: TagTone };
  dimmed?: boolean;
  action?: { label: string; tone: 'rani' | 'teal'; onPress: () => void };
};

// One lesson in "Mijn lessen": date block, class, status tag and an optional action.
export default function LessonCard({ lesson, tag, dimmed, action }: LessonCardProps) {
  const meta = styleMeta[lesson.session.style];
  const date = toDate(lesson.date);
  return (
    <View style={[styles.card, dimmed && styles.cardDimmed]}>
      <View style={[styles.dateBox, { backgroundColor: dimmed ? '#CFC6D8' : meta.color }]}>
        <Text style={styles.dateNumber}>{date.getDate()}</Text>
        <Text style={styles.dateDay}>{WEEKDAYS[date.getDay()].slice(0, 2)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, dimmed && styles.textDimmed]}>{meta.label}</Text>
        <Text style={styles.time}>{lesson.session.time}</Text>
        <Tag label={tag.label} tone={tag.tone} />
      </View>
      {action ? (
        <Pressable
          style={[styles.actionBtn, action.tone === 'teal' && styles.actionBtnTeal]}
          onPress={action.onPress}
          hitSlop={6}>
          <Text style={[styles.actionText, action.tone === 'teal' && styles.actionTextTeal]}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  cardDimmed: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  dateBox: {
    width: 46,
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dateNumber: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: '#fff',
  },
  dateDay: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  textDimmed: {
    color: colors.mutedText,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.mutedText,
    marginTop: 1,
  },
  actionBtn: {
    borderWidth: 1.5,
    borderColor: colors.rani,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  actionBtnTeal: {
    borderColor: colors.teal,
  },
  actionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.rani,
  },
  actionTextTeal: {
    color: colors.teal,
  },
});
