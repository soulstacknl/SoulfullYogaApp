import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import RosterRow from '@/components/RosterRow';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';

export default function RosterScreen() {
  const { day, id } = useLocalSearchParams<{ day: string; id: string }>();
  const { days, rosterBySession, adjustCapacity, toggleCheckIn, adjustStrip } = useSchedule();

  const session = days.find((d) => d.day === day)?.classes.find((c) => c.id === id);
  const roster = rosterBySession[id ?? ''] ?? [];

  if (!session) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Vandaag" onBack={() => router.back()} title="Les niet gevonden" subtitle="" />
      </View>
    );
  }

  const meta = styleMeta[session.style];

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
        <Text style={styles.capacityLabel}>Maximaal aantal plekken</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepperBtn}
            onPress={() => adjustCapacity(day, id, -1)}
            hitSlop={10}>
            <Text style={styles.stepperBtnText}>–</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{session.capacity}</Text>
          <Pressable
            style={styles.stepperBtn}
            onPress={() => adjustCapacity(day, id, 1)}
            hitSlop={10}>
            <Text style={styles.stepperBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {roster.map((entry) => (
          <RosterRow
            key={entry.id}
            entry={entry}
            onToggleCheckIn={() => toggleCheckIn(id, entry.id)}
            onAdjustStrip={(delta) => adjustStrip(id, entry.id, delta)}
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.ivory,
    lineHeight: 20,
  },
  stepperValue: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    minWidth: 20,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 4,
  },
});
