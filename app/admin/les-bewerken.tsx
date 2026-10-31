import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateField } from '@/components/DateTimeField';
import ScreenHeader from '@/components/ScreenHeader';
import Stepper from '@/components/Stepper';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { dateLabel, plusDays } from '@/lib/dutchDate';
import { startTimeOf } from '@/lib/schedule';

// One weekly lesson: default capacity, stopping it, or a holiday for just this lesson.
export default function LesBewerkenScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data, today, sessionById, adjustDefaultCapacity, setSessionUntil } = useSchedule();
  const [until, setUntil] = useState(() => plusDays(today, 7));

  const session = sessionById(sessionId ?? '');
  if (!session) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Terug" onBack={() => router.back()} title="Les niet gevonden" subtitle="" />
      </View>
    );
  }

  const standing = new Set(
    data.enrollments
      .filter((e) => e.sessionId === session.id && plusDays(e.start, 7 * e.weeks) > today)
      .map((e) => e.email)
  ).size;

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow={styleMeta[session.style].label}
        title={`${session.day} ${startTimeOf(session)}`}
        subtitle={`${session.time} · ${standing} vaste ${standing === 1 ? 'klant' : 'klanten'} met de app`}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.panel}>
          <View style={styles.panelRow}>
            <Text style={styles.panelLabel}>Standaard aantal plekken</Text>
            <Stepper value={session.capacity} onChange={(d) => adjustDefaultCapacity(session.id, d)} />
          </View>
          <Text style={styles.note}>Geldt voor elke week, behalve datums die je apart hebt aangepast.</Text>
        </View>

        <Text style={styles.sectionLabel}>Vaste les stoppen</Text>
        {session.until ? (
          <>
            <Text style={styles.status}>Laatste les: {dateLabel(session.until)}</Text>
            <Pressable style={[styles.outlineBtn, styles.outlineBtnTeal]} onPress={() => setSessionUntil(session.id, null)}>
              <Text style={[styles.outlineBtnText, styles.outlineBtnTextTeal]}>Toch laten doorlopen</Text>
            </Pressable>
          </>
        ) : (
          <>
            <DateField label="Laatste les op" value={until} onChange={(v) => v && v >= today && setUntil(v)} />
            <Pressable style={styles.outlineBtn} onPress={() => setSessionUntil(session.id, until)}>
              <Text style={styles.outlineBtnText}>Stoppen na deze datum</Text>
            </Pressable>
          </>
        )}

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Tijdelijk niet</Text>
        <Pressable
          style={styles.inkBtn}
          onPress={() => router.push({ pathname: '/admin/vervallen', params: { sessionId: session.id } })}>
          <Text style={styles.inkBtnText}>🌴 Vakantie voor alleen deze les</Text>
        </Pressable>
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
    paddingTop: 18,
  },
  panel: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.mutedText,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
    marginBottom: 10,
  },
  sectionSpaced: {
    marginTop: 22,
  },
  status: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: 12,
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 13.5,
    alignItems: 'center',
  },
  outlineBtnTeal: {
    borderColor: colors.teal,
  },
  outlineBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: colors.rani,
  },
  outlineBtnTextTeal: {
    color: colors.teal,
  },
  inkBtn: {
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  inkBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
});
