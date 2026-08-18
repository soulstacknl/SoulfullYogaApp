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

type Selection = { day: string; id: string };

export default function ScheduleScreen() {
  const user = useCurrentUser();
  const isAdmin = user?.role === 'admin';

  const { days, bookSession, adjustCapacity, adjustAvailable } = useSchedule();
  const [selected, setSelected] = useState<Selection | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const selectedSession = selected
    ? days
        .find((d) => d.day === selected.day)
        ?.classes.find((c) => c.id === selected.id)
    : null;
  const sheetSession = selectedSession && selected ? { ...selectedSession, day: selected.day } : null;

  const openBooking = (day: string, session: ClassSession) => setSelected({ day, id: session.id });
  const closeBooking = () => setSelected(null);

  const confirmBooking = () => {
    if (!selected) return;
    const booked = bookSession(selected.day, selected.id);
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
        {days.map(({ day, classes }, index) => (
          <View key={day}>
            <Text style={[styles.dayLabel, index === 0 && styles.dayLabelFirst]}>{day}</Text>
            {classes.map((session) => (
              <ClassCard key={session.id} session={session} onPress={(s) => openBooking(day, s)} />
            ))}
          </View>
        ))}
      </ScrollView>

      <BookingSheet
        session={sheetSession}
        isAdmin={isAdmin}
        onClose={closeBooking}
        onConfirm={confirmBooking}
        onAdjustCapacity={(delta) => selected && adjustCapacity(selected.day, selected.id, delta)}
        onAdjustAvailable={(delta) => selected && adjustAvailable(selected.day, selected.id, delta)}
      />
      <Toast message="Boeking bevestigd ✓" visible={toastVisible} />
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
});
