import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';

import BookingSheet from '@/components/BookingSheet';
import type { LessonSelection } from '@/components/BookingSheet';
import ClassCard, { PrivateClassCard } from '@/components/ClassCard';
import type { SpotsTone } from '@/components/ClassCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import MonthCalendar from '@/components/MonthCalendar';
import ScreenHeader from '@/components/ScreenHeader';
import Toast, { useToast } from '@/components/Toast';
import { colors, fonts } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useCurrentUser, useUsers } from '@/contexts/UsersContext';
import type { Session } from '@/data/schedule';
import type { PrivateLesson } from '@/lib/schedule';
import { capitalize, dateLabel, isoOf, monthStart, MONTHS, plusDays, toDate } from '@/lib/dutchDate';
import { isExtra, MONTHS_AHEAD } from '@/lib/schedule';

// One page = one month. The current month only shows what's still to come.
export default function ScheduleScreen() {
  const user = useCurrentUser();
  const isAdmin = user?.role === 'admin';
  const schedule = useSchedule();
  const { now, today } = schedule;

  const [month, setMonth] = useState(0);
  const [selected, setSelected] = useState<LessonSelection | null>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const toast = useToast();
  const { users } = useUsers();
  const scroll = useRef<ScrollViewInstance>(null);
  const dayY = useRef<Record<string, number>>({});

  const first = monthStart(month, now);
  // The admin also sees the private lessons in the timetable.
  const privates = isAdmin ? schedule.upcomingPrivates().filter((p) => !p.cancelled) : [];
  const days: { date: string; sessions: Session[]; privates: PrivateLesson[] }[] = [];
  for (let date = month === 0 ? today : isoOf(first); toDate(date).getMonth() === first.getMonth(); date = plusDays(date, 1)) {
    const sessions = schedule.sessionsOn(date).filter((s) => !schedule.hasStarted(s, date));
    const privatesOn = privates.filter((p) => p.date === date);
    if (sessions.length || privatesOn.length) days.push({ date, sessions, privates: privatesOn });
  }

  const spotsFor = (session: Session, date: string): [string, SpotsTone] => {
    if (schedule.closureOf(session.id, date)) return ['Vervalt', 'muted'];
    if (user && !isAdmin) {
      const status = schedule.statusFor(user.email, session.id, date);
      if (status?.cancelled) return ['Afgemeld', 'muted'];
      if (status?.source === 'aanvraag') return ['Aangevraagd', 'pending'];
      if (status) return ['✓ Ingepland', 'mine'];
    }
    const occupancy = schedule.occupancy(session.id, date);
    return occupancy.available <= 0
      ? ['Vol', 'full']
      : [`${occupancy.available}/${occupancy.capacity} beschikbaar`, 'muted'];
  };

  const monthName = (offset: number) => MONTHS[monthStart(offset, now).getMonth()];

  return (
    <View style={styles.container}>
      <ScreenHeader
        eyebrow={isAdmin ? 'Beheerder' : undefined}
        title="Soulful Yoga"
        subtitle="Meer rust en ruimte voor jezelf"
      />
      <View style={styles.monthNav}>
        <Pressable
          style={[styles.monthBtn, month === 0 && styles.monthBtnOff]}
          onPress={() => setMonth((m) => Math.max(0, m - 1))}
          disabled={month === 0}
          hitSlop={8}>
          <Text style={styles.monthBtnText}>‹</Text>
        </Pressable>
        <View style={styles.monthLabelWrap}>
          <Text style={styles.monthLabel}>
            {capitalize(monthName(month))} {first.getFullYear()}
          </Text>
          {month === 0 ? <Text style={styles.monthSub}>resterende lessen</Text> : null}
        </View>
        <Pressable
          style={[styles.monthBtn, month === MONTHS_AHEAD && styles.monthBtnOff]}
          onPress={() => setMonth((m) => Math.min(MONTHS_AHEAD, m + 1))}
          disabled={month === MONTHS_AHEAD}
          hitSlop={8}>
          <Text style={styles.monthBtnText}>›</Text>
        </Pressable>
      </View>

      <ScrollView key={month} ref={scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MonthCalendar
          first={first}
          today={today}
          lessonsOn={(date) => [
            ...schedule.sessionsOn(date).filter((s) => !schedule.closureOf(s.id, date)).map((s) => s.style),
            // The admin also sees a dot per private lesson.
            ...(isAdmin ? schedule.data.privates.filter((p) => p.date === date && !p.cancelled).map(() => 'prive' as const) : []),
          ]}
          onSelect={(date) => {
            const y = dayY.current[date];
            if (y !== undefined) scroll.current?.scrollTo({ y: y - 8, animated: true });
          }}
        />
        {days.length === 0 ? (
          <>
            <Text style={styles.empty}>Geen lessen meer in {monthName(month)}.</Text>
            {month < MONTHS_AHEAD ? (
              <Pressable style={styles.nextBtn} onPress={() => setMonth((m) => m + 1)}>
                <Text style={styles.nextBtnText}>Bekijk {monthName(month + 1)} ›</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          days.map(({ date, sessions, privates: privatesOn }, index) => (
            <View key={date} onLayout={(e) => (dayY.current[date] = e.nativeEvent.layout.y)}>
              <Text
                style={[
                  styles.dayLabel,
                  index === 0 && styles.dayLabelFirst,
                  index > 0 && toDate(date).getDay() === 1 && styles.dayLabelWeekStart,
                ]}>
                {dateLabel(date)}
              </Text>
              {[...sessions, ...privatesOn]
                .sort((x, y) => x.time.localeCompare(y.time))
                .map((item) => {
                  if ('email' in item) {
                    return (
                      <PrivateClassCard
                        key={item.id}
                        name={users.find((u) => u.email === item.email)?.name ?? ''}
                        time={item.time}
                        onPress={() => router.push('/admin/rooster-beheer')}
                      />
                    );
                  }
                  const session = item;
                  const [spotsText, spotsTone] = spotsFor(session, date);
                  return (
                    <ClassCard
                      key={session.id}
                      session={session}
                      spotsText={spotsText}
                      spotsTone={spotsTone}
                      closedReason={schedule.closureOf(session.id, date)?.reason}
                      extra={isExtra(session)}
                      onPress={() => setSelected({ sessionId: session.id, date })}
                    />
                  );
                })}
            </View>
          ))
        )}
      </ScrollView>

      <BookingSheet
        selection={selected}
        onClose={() => setSelected(null)}
        onLoginRequired={() => {
          setSelected(null);
          router.push('/profiel');
        }}
        onConfirm={(request) => {
          setSelected(null);
          setConfirm(request);
        }}
        onToast={toast.show}
      />
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBtnOff: {
    backgroundColor: colors.sand,
  },
  monthBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 22,
    lineHeight: 24,
    color: colors.ivory,
  },
  monthLabelWrap: {
    flex: 1,
    alignItems: 'center',
  },
  monthLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  monthSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.mutedText,
    marginTop: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  dayLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 15,
    color: colors.rani,
    marginTop: 22,
    marginBottom: 8,
  },
  dayLabelFirst: {
    marginTop: 16,
  },
  dayLabelWeekStart: {
    marginTop: 34,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 36,
  },
  nextBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  nextBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
});
