import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import WeeksPrompt from '@/components/WeeksPrompt';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { ClassEnrollment } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import type { MockUser } from '@/data/users';

type PendingAction = { kind: 'add'; user: MockUser } | { kind: 'remove'; enrollment: ClassEnrollment };

export default function PlekkenBeherenScreen() {
  const { day, id } = useLocalSearchParams<{ day: string; id: string }>();
  const { days, enrollmentsBySession, addEnrollment, removeEnrollment } = useSchedule();
  const { users } = useUsers();

  const [picking, setPicking] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const session = days.find((d) => d.day === day)?.classes.find((c) => c.id === id);
  const enrolled = enrollmentsBySession[id ?? ''] ?? [];
  const isFull = session ? session.available <= 0 : true;

  if (!session) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Rooster" onBack={() => router.back()} title="Les niet gevonden" subtitle="" />
      </View>
    );
  }

  const meta = styleMeta[session.style];
  const enrolledEmails = new Set(enrolled.map((e) => e.email));
  const pickable = users.filter((u) => u.role === 'student' && !enrolledEmails.has(u.email));

  const closePrompt = () => setPending(null);

  const handleConfirm = (weeks: number) => {
    if (!pending || !day || !id) return;
    if (pending.kind === 'add') {
      addEnrollment(day, id, { name: pending.user.name, email: pending.user.email, phone: pending.user.phone }, weeks);
    } else {
      removeEnrollment(day, id, pending.enrollment.id);
    }
    closePrompt();
    setPicking(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Rooster"
        onBack={() => router.back()}
        eyebrow={meta.label}
        title={session.time}
        subtitle={`${day} · ${session.available} / ${session.capacity} plekken beschikbaar`}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {picking ? (
          <>
            <Text style={styles.sectionLabel}>Kies een klant</Text>
            {pickable.length === 0 ? (
              <Text style={styles.empty}>Alle klanten zijn al toegevoegd</Text>
            ) : (
              pickable.map((u) => (
                <Pressable
                  key={u.email}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() => setPending({ kind: 'add', user: u })}>
                  <View style={styles.info}>
                    <Text style={styles.name}>{u.name}</Text>
                    <Text style={styles.detail}>{u.email}</Text>
                    <Text style={styles.detail}>{u.phone}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))
            )}
            <Pressable style={styles.cancelPickBtn} onPress={() => setPicking(false)}>
              <Text style={styles.cancelPickBtnText}>Terug naar overzicht</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={[styles.addBtn, isFull && styles.addBtnDisabled]}
              onPress={() => !isFull && setPicking(true)}
              disabled={isFull}>
              <Text style={styles.addBtnText}>{isFull ? 'Vol — geen plekken meer' : '+ Klant toevoegen'}</Text>
            </Pressable>

            {enrolled.length === 0 ? (
              <Text style={styles.empty}>Nog geen klanten toegevoegd</Text>
            ) : (
              enrolled.map((e) => (
                <View key={e.id} style={styles.row}>
                  <View style={styles.info}>
                    <Text style={styles.name}>{e.name}</Text>
                    <Text style={styles.detail}>{e.email}</Text>
                    <Text style={styles.detail}>{e.phone}</Text>
                    <Text style={styles.weeks}>{e.weeks} weken</Text>
                  </View>
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => setPending({ kind: 'remove', enrollment: e })}
                    hitSlop={10}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <WeeksPrompt
        visible={pending !== null}
        title={
          pending?.kind === 'add'
            ? `${pending.user.name} toevoegen voor hoeveel weken?`
            : pending?.kind === 'remove'
              ? `${pending.enrollment.name} verwijderen voor hoeveel weken?`
              : ''
        }
        confirmLabel={pending?.kind === 'add' ? 'Toevoegen' : 'Verwijderen'}
        onCancel={closePrompt}
        onConfirm={handleConfirm}
      />
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
  sectionLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
    marginBottom: 10,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 24,
  },
  addBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnDisabled: {
    backgroundColor: colors.sand,
  },
  addBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 14,
    marginBottom: 10,
  },
  rowPressed: {
    transform: [{ scale: 0.98 }],
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  detail: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.mutedText,
    marginTop: 1,
  },
  weeks: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    color: colors.teal,
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: colors.sand,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.rani,
  },
  cancelPickBtn: {
    alignItems: 'center',
    marginTop: 10,
  },
  cancelPickBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.mutedText,
    textDecorationLine: 'underline',
  },
});
