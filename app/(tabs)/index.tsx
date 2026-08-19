import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import BookingSheet from '@/components/BookingSheet';
import ClassCard from '@/components/ClassCard';
import ScreenHeader from '@/components/ScreenHeader';
import Toast from '@/components/Toast';
import { colors, fonts } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useCurrentUser } from '@/contexts/UsersContext';
import type { ClassSession } from '@/data/schedule';
import { dateForWeekday, formatDDMMYYYY } from '@/lib/dutchDate';

const WEEKS_AHEAD = 3;

type Selection = { day: string; id: string };

export default function ScheduleScreen() {
  const user = useCurrentUser();
  const isAdmin = user?.role === 'admin';

  const { days, bookSession, hasRequested, adjustCapacity, adjustAvailable } = useSchedule();
  const [selected, setSelected] = useState<Selection | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const selectedSession = selected
    ? days
        .find((d) => d.day === selected.day)
        ?.classes.find((c) => c.id === selected.id)
    : null;
  const sheetSession = selectedSession && selected ? { ...selectedSession, day: selected.day } : null;
  const alreadyRequested = selected ? hasRequested(selected.day, selected.id, user?.email ?? '—') : false;

  const openBooking = (day: string, session: ClassSession) => setSelected({ day, id: session.id });
  const closeBooking = () => setSelected(null);

  const confirmBooking = () => {
    if (!selected) return;
    const booked = bookSession(selected.day, selected.id, {
      name: user?.name ?? 'Gast',
      email: user?.email ?? '—',
    });
    if (!booked) return;
    setSelected(null);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        eyebrow={isAdmin ? 'Beheerder' : undefined}
        title="Soulful Yoga"
        subtitle="Meer rust en ruimte voor jezelf"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {Array.from({ length: WEEKS_AHEAD }, (_, weekOffset) =>
          days.map(({ day, classes }, index) => {
            const dateLabel = formatDDMMYYYY(dateForWeekday(day, weekOffset));
            const isVeryFirst = weekOffset === 0 && index === 0;
            const isWeekStart = weekOffset > 0 && index === 0;
            return (
              <View key={`${weekOffset}-${day}`}>
                <Text
                  style={[
                    styles.dayLabel,
                    isVeryFirst && styles.dayLabelFirst,
                    isWeekStart && styles.dayLabelWeekStart,
                  ]}>
                  {day} - {dateLabel}
                </Text>
                {classes.map((session) => (
                  <ClassCard
                    key={`${weekOffset}-${session.id}`}
                    session={session}
                    onPress={(s) => openBooking(day, s)}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      <BookingSheet
        session={sheetSession}
        isAdmin={isAdmin}
        isLoggedIn={user !== null}
        alreadyRequested={alreadyRequested}
        onClose={closeBooking}
        onConfirm={confirmBooking}
        onLoginRequired={() => {
          closeBooking();
          router.push('/profiel');
        }}
        onManageSpots={() => {
          if (!selected) return;
          const { day, id } = selected;
          closeBooking();
          router.push({ pathname: '/admin/plekken', params: { day, id } });
        }}
        onAdjustCapacity={(delta) => selected && adjustCapacity(selected.day, selected.id, delta)}
        onAdjustAvailable={(delta) => selected && adjustAvailable(selected.day, selected.id, delta)}
      />
      <Toast message="Reservering aangevraagd ✓" visible={toastVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
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
    marginTop: 4,
  },
  dayLabelWeekStart: {
    marginTop: 34,
  },
});
