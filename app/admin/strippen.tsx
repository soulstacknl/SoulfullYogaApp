import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import ScreenHeader from '@/components/ScreenHeader';
import Toast, { useToast } from '@/components/Toast';
import UserStripRow from '@/components/UserStripRow';
import { colors } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { CARD_SIZE, useUsers } from '@/contexts/UsersContext';
import { currentStandingSession, startTimeOf } from '@/lib/schedule';

export default function StrippenkaartenScreen() {
  const { students, adjustStrip, activateCard } = useUsers();
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const toast = useToast();
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
        subtitle="Pas strippen aan of activeer een nieuwe kaart"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {students.map((student) => (
          <UserStripRow
            key={student.email}
            user={student}
            detail={standingLabel(student.email)}
            onAdjust={(delta) => adjustStrip(student.email, delta)}
            onActivateCard={() =>
              setConfirm({
                title: 'Nieuwe strippenkaart?',
                message: `${student.name} krijgt een nieuwe ${CARD_SIZE}-strippenkaart: ${student.strippen ?? 0} → ${(student.strippen ?? 0) + CARD_SIZE} strippen.`,
                confirmLabel: 'Activeren',
                onConfirm: () => {
                  activateCard(student.email);
                  toast.show('Strippenkaart geactiveerd ✓');
                },
              })
            }
          />
        ))}
      </ScrollView>
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
  content: {
    padding: 20,
    paddingTop: 14,
  },
});
