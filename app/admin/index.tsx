import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdminClassCard from '@/components/AdminClassCard';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { ClassSession } from '@/data/schedule';
import { todayDutchLabel, todayWeekdayName } from '@/lib/dutchDate';

export default function VandaagScreen() {
  const { days } = useSchedule();

  const todayName = todayWeekdayName();
  const todayClasses = days.find((d) => d.day === todayName)?.classes ?? [];

  const openRoster = (session: ClassSession) => {
    router.push({ pathname: '/admin/roster', params: { day: todayName, id: session.id } });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Vandaag"
        subtitle={todayDutchLabel()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {todayClasses.length === 0 ? (
          <Text style={styles.empty}>Geen lessen vandaag</Text>
        ) : (
          todayClasses.map((session) => (
            <AdminClassCard key={session.id} session={session} onPress={openRoster} />
          ))
        )}
      </ScrollView>
      {todayClasses.length > 0 ? <Text style={styles.hint}>Tik op een les om de klas te openen</Text> : null}
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
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#A89BB5',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
