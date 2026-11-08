import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import ScreenHeader from '@/components/ScreenHeader';
import Tag from '@/components/Tag';
import WeeksPrompt from '@/components/WeeksPrompt';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { LessonStatus } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import type { AppUser } from '@/data/users';
import { dateLabel, daysBetween, shortDate } from '@/lib/dutchDate';
import { enrollmentOf, ONGOING_WEEKS, startTimeOf } from '@/lib/schedule';

type PendingAction = { kind: 'add' | 'remove'; user: AppUser };

// Who takes part in one lesson date: standing customers, one-off bookings and
// requests. New standing customers are planned from this date onward.
export default function DeelnemersScreen() {
  const { sessionId, date } = useLocalSearchParams<{ sessionId: string; date: string }>();
  const schedule = useSchedule();
  const { students } = useUsers();
  const [picking, setPicking] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const session = schedule.sessionById(sessionId ?? '');
  if (!session || !date) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Terug" onBack={() => router.back()} title="Les niet gevonden" subtitle="" />
      </View>
    );
  }

  const meta = styleMeta[session.style];
  const occupancy = schedule.occupancy(session.id, date);
  const started = schedule.hasStarted(session, date);
  const canAdd = occupancy.available > 0 && !started;
  const attending = schedule.attendees(session.id, date);
  const cancelled = students.filter((u) => schedule.statusFor(u.email, session.id, date)?.cancelled);
  const pickable = students.filter((u) => !enrollmentOf(schedule.data, u.email, session.id, date));
  const lessonName = `${meta.label} ${shortDate(date)} ${startTimeOf(session)}`;

  const sourceTag = (status: LessonStatus) => {
    if (status.source === 'aanvraag') return <Tag label="Aanvraag" tone="pending" />;
    if (status.source === 'los') return <Tag label="Losse les" tone="ink" />;
    const e = status.enrollment!;
    const left = e.weeks - daysBetween(e.start, date) / 7;
    const label = e.weeks >= ONGOING_WEEKS ? 'Vaste klant' : `Vaste klant · nog ${left} ${left === 1 ? 'week' : 'weken'}`;
    return <Tag label={label} tone="teal" />;
  };

  const askRemove = (user: AppUser, status: LessonStatus) => {
    if (status.source === 'vast') {
      setPending({ kind: 'remove', user });
      return;
    }
    setConfirm({
      title: `${user.name} afmelden?`,
      message: `Losse les ${lessonName}. De plek komt weer vrij.`,
      confirmLabel: 'Afmelden',
      onConfirm: () => schedule.cancelLesson(user.email, session.id, date, 'beheer'),
    });
  };

  const handleWeeks = (weeks: number) => {
    if (!pending) return;
    if (pending.kind === 'add') schedule.addStanding(session.id, date, pending.user.email, weeks);
    else schedule.removeStanding(session.id, date, pending.user.email, weeks);
    setPending(null);
    setPicking(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow={meta.label}
        title={session.time}
        subtitle={`${dateLabel(date)} · ${occupancy.available} / ${occupancy.capacity} plekken vrij`}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {picking ? (
          <>
            <Text style={styles.sectionLabel}>Kies een vaste klant</Text>
            <Text style={styles.note}>
              Wordt ingepland vanaf {dateLabel(date)}, elke {session.day.toLowerCase()}.
            </Text>
            {pickable.length === 0 ? (
              <Text style={styles.empty}>Alle klanten zijn al vaste klant</Text>
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
              style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
              onPress={() => setPicking(true)}
              disabled={!canAdd}>
              <Text style={styles.addBtnText}>
                {started ? 'Les is al begonnen' : canAdd ? '+ Vaste klant toevoegen' : 'Vol — geen plekken meer'}
              </Text>
            </Pressable>

            <Text style={styles.sectionLabel}>Ingepland op {dateLabel(date).toLowerCase()}</Text>
            {attending.map(({ person, status }) => {
              const user = students.find((u) => u.email === person.email)!;
              return (
                <View key={person.email} style={styles.row}>
                  <View style={styles.info}>
                    <Text style={styles.name}>{person.name}</Text>
                    <Text style={styles.detail}>{person.email}</Text>
                    {sourceTag(status)}
                  </View>
                  {!started && status.source !== 'aanvraag' ? (
                    <Pressable style={styles.removeBtn} onPress={() => askRemove(user, status)} hitSlop={10}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
            {cancelled.map((u) => (
              <View key={u.email} style={[styles.row, styles.rowCancelled]}>
                <View style={styles.info}>
                  <Text style={styles.name}>{u.name}</Text>
                  <Text style={styles.detail}>{u.email}</Text>
                  {schedule.cancellationOf(u.email, session.id, date)?.charged ? (
                    <Tag label="Afgemeld < 24 uur · −1 strip" tone="rani" />
                  ) : (
                    <Tag label="Afgemeld" tone="muted" />
                  )}
                </View>
              </View>
            ))}
            <Text style={styles.note}>
              {attending.length ? '' : 'Nog geen app-klanten ingepland. '}+{' '}
              {(schedule.data.roster[session.id] ?? []).length} vaste deelnemers op de presentielijst.
            </Text>
          </>
        )}
      </ScrollView>

      <WeeksPrompt
        visible={pending !== null}
        title={
          pending?.kind === 'add'
            ? `${pending.user.name} vast inplannen voor hoeveel weken?`
            : pending
              ? `${pending.user.name} afmelden voor hoeveel weken?`
              : ''
        }
        hint={
          pending?.kind === 'add'
            ? `Kies ${ONGOING_WEEKS} voor een doorlopende groepsles.`
            : `Kies ${ONGOING_WEEKS} om de groepsles helemaal te stoppen.`
        }
        confirmLabel={pending?.kind === 'add' ? 'Inplannen' : 'Afmelden'}
        onCancel={() => setPending(null)}
        onConfirm={handleWeeks}
      />
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
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
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.mutedText,
    marginTop: 4,
    marginBottom: 12,
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
  rowCancelled: {
    opacity: 0.6,
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
