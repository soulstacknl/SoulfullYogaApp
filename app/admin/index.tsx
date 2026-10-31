import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminClassCard from '@/components/AdminClassCard';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { dateLabel } from '@/lib/dutchDate';

export default function VandaagScreen() {
  const { today, sessionsOn, occupancy, closureOf } = useSchedule();
  const todayClasses = sessionsOn(today);

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
          todayClasses.map((session) => {
            const { booked, capacity } = occupancy(session.id, today);
            const closure = closureOf(session.id, today);
            return (
              <AdminClassCard
                key={session.id}
                session={session}
                booked={booked}
                capacity={capacity}
                closedReason={closure?.reason}
                onPress={
                  closure
                    ? undefined
                    : () => router.push({ pathname: '/admin/roster', params: { sessionId: session.id, date: today } })
                }
              />
            );
          })
        )}
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
    marginTop: 40,
  },
});
