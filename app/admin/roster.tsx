import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import RosterRow from '@/components/RosterRow';
import ScreenHeader from '@/components/ScreenHeader';
import Toast, { useToast } from '@/components/Toast';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { AttendanceEntry, Confirmation } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { shortDate } from '@/lib/dutchDate';
import { startTimeOf } from '@/lib/schedule';

type ConfirmedPerson = Confirmation['people'][number];

const chargeLabel = (p: ConfirmedPerson) =>
  !p.present
    ? 'Afwezig · geen strip'
    : p.charge === 'strip'
      ? 'Aanwezig · −1 strip'
      : p.charge === 'open'
        ? 'Aanwezig · geen strippen, openstaand'
        : 'Aanwezig · losse les';

// Attendance list for one lesson date. The schedule is the starting point; the
// admin corrects it and confirms — only then are strips deducted.
export default function PresentielijstScreen() {
  const { sessionId, date } = useLocalSearchParams<{ sessionId: string; date: string }>();
  const schedule = useSchedule();
  const { users, students } = useUsers();
  const [walkInName, setWalkInName] = useState('');
  const [picking, setPicking] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const toast = useToast();

  const session = schedule.sessionById(sessionId ?? '');
  if (!session || !date) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Vandaag" onBack={() => router.back()} title="Les niet gevonden" subtitle="" />
      </View>
    );
  }

  const meta = styleMeta[session.style];
  const lessonName = `${meta.label} ${shortDate(date)} ${startTimeOf(session)}`;
  const confirmation = schedule.confirmationOf(session.id, date);
  const started = schedule.hasStarted(session, date);

  const stripsOf = (p: AttendanceEntry) =>
    p.usesApp
      ? (users.find((u) => u.email === p.id)?.strippen ?? 0)
      : (schedule.data.roster[session.id] ?? []).find((e) => e.id === p.id)?.strips ?? 0;

  const header = (
    <ScreenHeader
      backLabel="Vandaag"
      onBack={() => router.back()}
      eyebrow={`${meta.label} · ${shortDate(date)}`}
      title={session.time}
      subtitle={confirmation ? `Bevestigd · ${confirmation.at}` : 'Klopt de planning met wie er is?'}
    />
  );

  if (confirmation) {
    const present = confirmation.people.filter((p) => p.present).length;
    const strips = confirmation.people.filter((p) => p.charge === 'strip').length;
    return (
      <View style={styles.container}>
        {header}
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.confirmedBox}>
            ✓ Presentie bevestigd: {present} aanwezig, {strips} {strips === 1 ? 'strip' : 'strippen'} afgeschreven
          </Text>
          {confirmation.people.map((p) => (
            <RosterRow key={p.id} name={p.name} usesApp={p.usesApp} present={p.present} detail={chargeLabel(p)} />
          ))}
          <Pressable
            style={styles.outlineBtn}
            onPress={() =>
              setConfirm({
                title: 'Bevestiging ongedaan maken?',
                message: `${lessonName}. De afgeschreven strippen komen terug en je kunt de lijst weer aanpassen.`,
                confirmLabel: 'Ongedaan maken',
                onConfirm: () => schedule.undoConfirmation(session.id, date),
              })
            }>
            <Text style={styles.outlineBtnText}>Bevestiging ongedaan maken</Text>
          </Pressable>
        </ScrollView>
        <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
        <Toast message={toast.message} visible={toast.visible} />
      </View>
    );
  }

  const list = schedule.attendanceList(session.id, date);
  const presentCount = list.filter((p) => p.present).length;
  const addable = students.filter((u) => !list.some((p) => p.id === u.email));

  const addWalkIn = () => {
    const name = walkInName.trim();
    if (!name) return;
    schedule.addAttendee(session.id, date, { id: `w-${Date.now()}`, name, usesApp: false, walkIn: true });
    setWalkInName('');
  };

  return (
    <View style={styles.container}>
      {header}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.note}>
          Volgens de planning staan deze mensen ingepland. Vink uit wie er niet is en voeg toe wie er extra is. De
          strippen gaan pas af als je bevestigt.
        </Text>
        {list.length === 0 ? <Text style={styles.empty}>Niemand ingepland.</Text> : null}
        {list.map((p) => (
          <RosterRow
            key={p.id}
            name={p.name}
            usesApp={p.usesApp}
            present={p.present}
            detail={[
              p.walkIn ? 'losse deelnemer' : `${stripsOf(p)} strippen`,
              p.planned ? '' : 'toegevoegd',
              p.present ? '' : 'afwezig',
            ]
              .filter(Boolean)
              .join(' · ')}
            onTogglePresent={() => schedule.setPresent(session.id, date, p.id, !p.present)}
            onRemove={p.planned ? undefined : () => schedule.removeAttendee(session.id, date, p.id)}
          />
        ))}

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Iemand toevoegen</Text>
          {addable.length ? (
            picking ? (
              addable.map((u) => (
                <Pressable
                  key={u.email}
                  style={styles.pickRow}
                  onPress={() => {
                    schedule.addAttendee(session.id, date, { id: u.email, name: u.name, usesApp: true });
                    setPicking(false);
                  }}>
                  <Text style={styles.pickName}>{u.name}</Text>
                  <Text style={styles.pickAdd}>+ Toevoegen</Text>
                </Pressable>
              ))
            ) : (
              <Pressable style={styles.smallBtn} onPress={() => setPicking(true)}>
                <Text style={styles.smallBtnText}>+ Klant met de app</Text>
              </Pressable>
            )
          ) : null}
          <View style={styles.walkInRow}>
            <TextInput
              style={styles.walkInInput}
              value={walkInName}
              onChangeText={setWalkInName}
              placeholder="Naam losse deelnemer"
              placeholderTextColor="#9DAFA2"
              onSubmitEditing={addWalkIn}
            />
            <Pressable style={styles.smallBtn} onPress={addWalkIn}>
              <Text style={styles.smallBtnText}>Toevoegen</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.confirmBtn, !started && styles.confirmBtnDisabled]}
          disabled={!started}
          onPress={() =>
            setConfirm({
              title: 'Presentie bevestigen?',
              message: `${lessonName}: ${presentCount} aanwezig, ${list.length - presentCount} afwezig. Bij elke aanwezige gaat nu één strip van de kaart.`,
              confirmLabel: 'Bevestigen',
              onConfirm: () => {
                schedule.confirmAttendance(session.id, date);
                toast.show('Presentie bevestigd ✓');
              },
            })
          }>
          <Text style={styles.confirmBtnText}>
            {started ? `Bevestig presentie (${presentCount} aanwezig)` : `Bevestigen kan vanaf ${startTimeOf(session)}`}
          </Text>
        </Pressable>
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
    paddingTop: 16,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.mutedText,
    marginBottom: 12,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    marginVertical: 16,
  },
  confirmedBox: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.teal,
    backgroundColor: '#EAF3EE',
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  panel: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
    gap: 8,
  },
  panelLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
  },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory,
  },
  pickName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  pickAdd: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.teal,
  },
  walkInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walkInInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  smallBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  smallBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.teal,
  },
  confirmBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: colors.sand,
  },
  confirmBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 13.5,
    alignItems: 'center',
    marginTop: 12,
  },
  outlineBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: colors.rani,
  },
});
