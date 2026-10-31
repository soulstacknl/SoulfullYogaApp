import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import UserStripRow from '@/components/UserStripRow';
import { colors } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { currentStandingSession, startTimeOf } from '@/lib/schedule';

export default function StrippenkaartenScreen() {
  const { students, adjustStrip } = useUsers();
  const { data, today } = useSchedule();
  const standingLabel = (email: string) => {
    const session = currentStandingSession(data, email, today);
    return session ? `vast: ${session.day.toLowerCase()} ${startTimeOf(session)}` : undefined;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Strippenkaarten"
        subtitle="Pas het aantal strippen aan"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {students.map((student) => (
          <UserStripRow
            key={student.email}
            user={student}
            detail={standingLabel(student.email)}
            onAdjust={(delta) => adjustStrip(student.email, delta)}
          />
        ))}
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
});
