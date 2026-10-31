import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import RosterRow from '@/components/RosterRow';
import ScreenHeader from '@/components/ScreenHeader';
import Stepper from '@/components/Stepper';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { lessonKey } from '@/lib/schedule';

// Attendance list for one lesson date: app customers scheduled that day plus
// the regular attendees without the app.
export default function RosterScreen() {
  const { sessionId, date } = useLocalSearchParams<{ sessionId: string; date: string }>();
  const schedule = useSchedule();
  const { users, adjustStrip } = useUsers();
  const session = schedule.sessionById(sessionId ?? '');

  if (!session || !date) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Vandaag" onBack={() => router.back()} title="Les niet gevonden" subtitle="" />
      </View>
    );
  }

  const meta = styleMeta[session.style];
  const checkins = schedule.data.checkins[lessonKey(session.id, date)] ?? {};
  const appCustomers = schedule
    .attendees(session.id, date)
    .filter((a) => a.status.source !== 'aanvraag')
    .map(({ person }) => users.find((u) => u.email === person.email)!)
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Vandaag"
        onBack={() => router.back()}
        eyebrow={meta.label}
        title={session.time}
        subtitle="Tik op een naam om in te checken"
      />

      <View style={styles.capacityEditor}>
        <Text style={styles.capacityLabel}>Plekken deze les</Text>
        <Stepper
          size="md"
          value={schedule.occupancy(session.id, date).capacity}
          onChange={(delta) => schedule.adjustCapacity(session.id, date, delta)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.note}>Klanten met de app (📱): de strip gaat automatisch af na de les.</Text>
        {appCustomers.map((user) => (
          <RosterRow
            key={user.email}
            name={user.name}
            strips={user.strippen ?? 0}
            checkedIn={!!checkins[user.email]}
            usesApp
            onToggleCheckIn={() => schedule.toggleCheckIn(session.id, date, user.email)}
            onAdjustStrip={(delta) => adjustStrip(user.email, delta)}
          />
        ))}
        {(schedule.data.roster[session.id] ?? []).map((entry) => (
          <RosterRow
            key={entry.id}
            name={entry.name}
            strips={entry.strips}
            checkedIn={!!checkins[entry.id]}
            usesApp={false}
            onToggleCheckIn={() => schedule.toggleCheckIn(session.id, date, entry.id)}
            onAdjustStrip={(delta) => schedule.adjustRosterStrip(session.id, entry.id, delta)}
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
  capacityEditor: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacityLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  content: {
    padding: 20,
    paddingTop: 16,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.mutedText,
    marginBottom: 12,
  },
});
