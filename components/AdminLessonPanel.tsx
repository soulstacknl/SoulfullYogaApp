import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import Tag from '@/components/Tag';
import WeeksPrompt from '@/components/WeeksPrompt';
import { colors, fonts, styleMeta } from '@/constants/theme';
import type { LessonStatus } from '@/contexts/ScheduleContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import type { Session } from '@/data/schedule';
import type { AppUser } from '@/data/users';
import { daysBetween, shortDate } from '@/lib/dutchDate';
import { enrollmentOf, ONGOING_WEEKS, startTimeOf } from '@/lib/schedule';

type PendingAction = { kind: 'add' | 'remove'; user: AppUser };

// The admin's view of one lesson date in the lesson sheet: everyone who takes part,
// with remove buttons, and "Klant toevoegen" right below the list.
export default function AdminLessonPanel({ session, date, onToast }: { session: Session; date: string; onToast: (message: string) => void }) {
  const schedule = useSchedule();
  const { students } = useUsers();
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const occupancy = schedule.occupancy(session.id, date);
  const started = schedule.hasStarted(session, date);
  const canAdd = occupancy.available > 0 && !started;
  const attending = schedule.attendees(session.id, date);
  const cancelled = students.filter((u) => schedule.statusFor(u.email, session.id, date)?.cancelled);
  const roster = schedule.data.roster[session.id] ?? [];
  const lessonName = `${styleMeta[session.style].label} ${shortDate(date)} ${startTimeOf(session)}`;
  const q = query.trim().toLowerCase();
  const pickable = students
    .filter((u) => !enrollmentOf(schedule.data, u.email, session.id, date) && !attending.some((a) => a.person.email === u.email))
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q))
    .slice(0, 30);

  const sourceTag = (status: LessonStatus) => {
    if (status.source === 'aanvraag') return <Tag label="Aanvraag" tone="pending" />;
    if (status.source === 'los') return <Tag label="Losse les" tone="ink" />;
    const e = status.enrollment!;
    const left = e.weeks - daysBetween(e.start, date) / 7;
    return <Tag label={e.weeks >= ONGOING_WEEKS ? 'Vaste klant' : `Vaste klant · nog ${left} ${left === 1 ? 'week' : 'weken'}`} tone="teal" />;
  };

  const askRemove = (user: AppUser, status: LessonStatus) => {
    if (status.source === 'vast') return setPending({ kind: 'remove', user });
    setConfirm({
      title: `${user.name} afmelden?`,
      message: `Losse les ${lessonName}. De plek komt weer vrij.`,
      confirmLabel: 'Afmelden',
      onConfirm: () => {
        schedule.cancelLesson(user.email, session.id, date, 'beheer');
        onToast(`${user.name} afgemeld`);
      },
    });
  };

  const handleWeeks = (weeks: number) => {
    if (!pending) return;
    if (pending.kind === 'add') {
      if (schedule.addStanding(session.id, date, pending.user.email, weeks)) onToast(`${pending.user.name} ingepland ✓`);
    } else {
      schedule.removeStanding(session.id, date, pending.user.email, weeks);
      onToast(`${pending.user.name} afgemeld`);
    }
    setPending(null);
    setPicking(false);
    setQuery('');
  };

  return (
    <>
      {picking ? (
        <>
          <Text style={styles.label}>Klant toevoegen</Text>
          <Text style={styles.note}>
            Vanaf {shortDate(date)} elke {session.day.toLowerCase()}. Kies 1 week voor een losse les.
          </Text>
          <TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="Zoek op naam of e-mail" placeholderTextColor="#9DAFA2" autoCorrect={false} />
          {pickable.length === 0 ? <Text style={styles.empty}>Geen klant gevonden.</Text> : null}
          {pickable.map((u) => (
            <Pressable key={u.email} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]} onPress={() => setPending({ kind: 'add', user: u })}>
              <View style={styles.info}>
                <Text style={styles.name}>{u.name}</Text>
                <Text style={styles.detail}>{u.strippen === null ? 'geen kaart' : `${u.strippen} strippen`}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
          <Pressable style={styles.linkBtn} onPress={() => setPicking(false)}>
            <Text style={styles.linkText}>Terug naar deelnemers</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.label}>
            Deelnemers · {occupancy.booked} / {occupancy.capacity}
          </Text>
          {attending.length === 0 ? <Text style={styles.empty}>Nog niemand ingepland.</Text> : null}
          {attending.map(({ person, status }) => {
            const user = students.find((u) => u.email === person.email);
            return (
              <View key={person.email} style={styles.row}>
                <View style={styles.info}>
                  <Text style={styles.name}>{person.name}</Text>
                  {sourceTag(status)}
                </View>
                {user && !started && status.source !== 'aanvraag' ? (
                  <Pressable style={styles.removeBtn} onPress={() => askRemove(user, status)} hitSlop={10} accessibilityLabel={`${person.name} afmelden`}>
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
          {roster.map((r) => (
            <View key={r.id} style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>{r.name}</Text>
                <Tag label="Zonder app" tone="muted" />
              </View>
            </View>
          ))}
          {cancelled.map((u) => (
            <View key={u.email} style={[styles.row, { opacity: 0.6 }]}>
              <View style={styles.info}>
                <Text style={styles.name}>{u.name}</Text>
                {schedule.cancellationOf(u.email, session.id, date)?.charged ? (
                  <Tag label="Afgemeld < 24 uur · −1 strip" tone="rani" />
                ) : (
                  <Tag label="Afgemeld" tone="muted" />
                )}
              </View>
            </View>
          ))}
          <Pressable style={[styles.addBtn, !canAdd && styles.addBtnOff]} onPress={() => setPicking(true)} disabled={!canAdd}>
            <Text style={styles.addText}>{started ? 'Les is al begonnen' : canAdd ? '＋ Klant toevoegen' : 'Vol — geen plekken meer'}</Text>
          </Pressable>
        </>
      )}

      <WeeksPrompt
        visible={pending !== null}
        title={pending?.kind === 'add' ? `${pending.user.name} inplannen voor hoeveel weken?` : pending ? `${pending.user.name} afmelden voor hoeveel weken?` : ''}
        hint={pending?.kind === 'add' ? `Kies ${ONGOING_WEEKS} voor een doorlopende vaste les.` : `Kies ${ONGOING_WEEKS} om de vaste les helemaal te stoppen.`}
        confirmLabel={pending?.kind === 'add' ? 'Inplannen' : 'Afmelden'}
        onCancel={() => setPending(null)}
        onConfirm={handleWeeks}
      />
      {confirm ? <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.rani, marginBottom: 8 },
  note: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.mutedText, marginBottom: 10 },
  empty: { fontFamily: fonts.body, fontSize: 13.5, color: colors.mutedText, marginVertical: 10, textAlign: 'center' },
  search: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.sand, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8 },
  info: { flex: 1 },
  name: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  detail: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText, marginTop: 1 },
  chevron: { fontSize: 22, color: colors.sand },
  removeBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.sand, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.rani },
  addBtn: { backgroundColor: colors.rani, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 6, marginBottom: 10 },
  addBtnOff: { backgroundColor: colors.sand },
  addText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#fff' },
  linkBtn: { alignItems: 'center', paddingVertical: 12 },
  linkText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mutedText, textDecorationLine: 'underline' },
});
