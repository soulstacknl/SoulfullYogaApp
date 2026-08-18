import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import UserStripRow from '@/components/UserStripRow';
import { colors } from '@/constants/theme';
import { useUsers } from '@/contexts/UsersContext';

export default function StrippenkaartenScreen() {
  const { users, adjustStrip } = useUsers();
  const students = users.filter((u) => u.role === 'student');

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
