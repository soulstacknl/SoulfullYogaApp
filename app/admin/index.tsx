import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminClassCard from '@/components/AdminClassCard';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { Session } from '@/data/schedule';
import { dateLabel, shortDate } from '@/lib/dutchDate';

// Docentmodus: today's lessons, plus earlier lessons whose attendance still needs confirming.
export default function VandaagScreen() {
  const { today, sessionsOn, occupancy, closureOf, confirmationOf, hasStarted, unconfirmedLessons } = useSchedule();
  const todayClasses = sessionsOn(today);
  const earlier = unconfirmedLessons().filter((l) => l.date !== today);

  const renderCard = (session: Session, date: string) => {
    const { booked, capacity } = occupancy(session.id, date);
    const closure = closureOf(session.id, date);
    const attendance = confirmationOf(session.id, date) ? 'confirmed' : hasStarted(session, date) ? 'todo' : undefined;
    return (
      <AdminClassCard
        key={`${session.id}-${date}`}
        session={session}
        booked={booked}
        capacity={capacity}
        closedReason={closure?.reason}
        attendance={attendance}
        dateLabel={date === today ? undefined : shortDate(date)}
        onPress={
          closure
            ? undefined
            : () => router.push({ pathname: '/admin/roster', params: { sessionId: session.id, date } })
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Vandaag"
        subtitle={dateLabel(today)}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {todayClasses.length === 0 ? (
          <Text style={styles.empty}>Geen lessen vandaag</Text>
        ) : (
          todayClasses.map((session) => renderCard(session, today))
        )}

        {earlier.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Nog te bevestigen</Text>
            <Text style={styles.note}>
              Eerdere lessen waarvan de presentie nog niet is bevestigd. Pas na bevestigen gaan de strippen af.
            </Text>
            {earlier.map(({ session, date }) => renderCard(session, date))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: 20,
    paddingTop: 14,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    marginVertical: 24,
  },
  sectionLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
    marginTop: 18,
    marginBottom: 4,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.mutedText,
    marginBottom: 12,
  },
});
