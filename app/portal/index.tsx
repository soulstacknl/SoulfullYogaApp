import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Meter, PageHeader, Pill } from '@/components/portal/ui';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { MONTHS, plusDays, shortDate, toDate, WEEKDAYS } from '@/lib/dutchDate';
import { isExtra } from '@/lib/schedule';

// ISO week number (weeks start on Monday, week 1 holds 4 January).
function weekNumber(iso: string) {
  const d = toDate(iso);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// Week calendar with the occupancy of every lesson; click a lesson for details.
export default function PortalRooster() {
  const schedule = useSchedule();
  const portal = usePortal();
  const { width } = useWindowDimensions();
  const [week, setWeek] = useState(0);

  const { today } = schedule;
  const weekday = schedule.now.getDay();
  const monday = plusDays(today, (weekday === 0 ? -6 : 1 - weekday) + week * 7);
  const days = Array.from({ length: 7 }, (_, i) => plusDays(monday, i));
  const columns = width >= 1100 ? 7 : width >= 800 ? 2 : 1;

  return (
    <View>
      <PageHeader title="Rooster" subtitle="Klik op een les voor bezetting, deelnemers en plekken.">
        <Btn label="‹" onPress={() => setWeek((w) => w - 1)} />
        <Text style={styles.weekLabel}>
          Week {weekNumber(monday)} · {shortDate(monday)} – {shortDate(days[6])}
        </Text>
        <Btn label="›" onPress={() => setWeek((w) => w + 1)} />
        {week !== 0 ? <Btn label="Deze week" onPress={() => setWeek(0)} /> : null}
      </PageHeader>

      <View style={styles.cal}>
        {days.map((date) => {
          const d = toDate(date);
          const lessons = schedule.sessionsOn(date);
          return (
            <View
              key={date}
              style={[styles.day, { flexBasis: `${100 / columns - 2}%` }, date === today && styles.today, date < today && { opacity: 0.6 }]}>
              <View style={styles.dayHead}>
                <Text style={styles.dayName}>{WEEKDAYS[d.getDay()]}</Text>
                <Text style={styles.dayDate}>
                  {d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)}
                </Text>
              </View>
              {lessons.length ? (
                lessons.map((session) => {
                  const closure = schedule.closureOf(session.id, date);
                  return (
                    <Pressable
                      key={session.id}
                      onPress={() => portal.openLesson(session.id, date)}
                      style={({ hovered }: { hovered?: boolean }) => [
                        styles.lesson,
                        { borderLeftColor: styleMeta[session.style].color },
                        closure && styles.closed,
                        hovered && { borderColor: colors.ink, borderLeftColor: styleMeta[session.style].color },
                      ]}>
                      <Text style={styles.time}>{session.time}</Text>
                      <Text style={styles.sub}>
                        {styleMeta[session.style].label}
                        {isExtra(session) ? ' · extra' : ''}
                        {closure ? ` · ${closure.reason}` : ''}
                      </Text>
                      {closure ? (
                        <Pill label="Vervalt" tone="muted" />
                      ) : (
                        <View style={{ flexDirection: 'row' }}>
                          <Meter occupancy={schedule.occupancy(session.id, date)} />
                        </View>
                      )}
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.none}>Geen lessen</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekLabel: { fontFamily: fonts.display, fontSize: 16, color: colors.ink, minWidth: 220, textAlign: 'center' },
  cal: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  day: { flexGrow: 1, backgroundColor: '#F7F1E6', borderRadius: 14, padding: 10, minHeight: 180, minWidth: 0 },
  today: { borderWidth: 2, borderColor: colors.rani, padding: 8 },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayName: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.ink },
  dayDate: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.mutedText },
  lesson: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderLeftWidth: 4, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8 },
  closed: { opacity: 0.6, borderStyle: 'dashed', backgroundColor: 'transparent' },
  time: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink },
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedText, marginTop: 1, marginBottom: 6 },
  none: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText },
});
