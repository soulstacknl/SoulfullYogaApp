import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Empty, Field, IconBtn, Input, Meta, Note, PageHeader, Pill, portalStyles, Preview, Row, s, Segmented, Select, StyleDot } from '@/components/portal/ui';
import type { TagTone } from '@/components/portal/ui';
import { styleMeta } from '@/constants/theme';
import type { AttendanceEntry, Confirmation } from '@/contexts/ScheduleContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { dateLabel, shortDate } from '@/lib/dutchDate';
import { startTimeOf } from '@/lib/schedule';

const chargeTag = (p: Confirmation['people'][number]): [string, TagTone] =>
  !p.present
    ? ['Afwezig · geen strip', 'muted']
    : p.charge === 'strip'
      ? ['−1 strip', 'teal']
      : p.charge === 'open'
        ? ['Geen strippen · openstaand', 'rani']
        : ['Losse les', 'ink'];

const typeTag = (p: AttendanceEntry): [string, TagTone] =>
  p.walkIn ? ['Losse deelnemer', 'ink'] : p.usesApp ? ['📱 App-klant', 'teal'] : ['Zonder app', 'muted'];

// The schedule is the starting point; the admin corrects and confirms. Only then are strips deducted.
export default function PortalPresentie() {
  const params = useLocalSearchParams<{ sessionId?: string; date?: string }>();
  const schedule = useSchedule();
  const { users, students } = useUsers();
  const portal = usePortal();
  const [date, setDate] = useState(params.date ?? schedule.today);
  const [picked, setPicked] = useState(params.sessionId ?? '');
  const [addEmail, setAddEmail] = useState('');
  const [walkIn, setWalkIn] = useState('');

  // Opened from a lesson (rooster or "Nog te bevestigen"): jump to that lesson.
  useEffect(() => {
    if (params.date) setDate(params.date);
    if (params.sessionId) setPicked(params.sessionId);
  }, [params.date, params.sessionId]);

  const lessons = schedule.sessionsOn(date).filter((x) => !schedule.closureOf(x.id, date));
  const session = lessons.find((x) => x.id === picked) ?? lessons[0];
  const todo = schedule.unconfirmedLessons();

  let body = <Empty text="Geen lessen op deze dag." />;
  if (session) {
    const lessonName = `${styleMeta[session.style].label} ${shortDate(date)} ${startTimeOf(session)}`;
    const confirmation = schedule.confirmationOf(session.id, date);
    const started = schedule.hasStarted(session, date);
    if (confirmation) {
      const present = confirmation.people.filter((p) => p.present).length;
      const strips = confirmation.people.filter((p) => p.charge === 'strip').length;
      body = (
        <>
          <Preview tone="teal" text={`✓ Bevestigd (${confirmation.at}): ${present} aanwezig, ${strips} ${strips === 1 ? 'strip' : 'strippen'} afgeschreven.`} />
          <View style={{ marginTop: 12 }}>
            {confirmation.people.map((p) => {
              const [label, tone] = chargeTag(p);
              return (
                <Row key={p.id} dim={!p.present}>
                  <Meta title={p.name} detail={`${typeTag(p)[0]}${p.planned ? '' : ' · toegevoegd'}`} />
                  <Pill label={label} tone={tone} />
                </Row>
              );
            })}
          </View>
          <View style={{ marginTop: 14, flexDirection: 'row' }}>
            <Btn
              label="Bevestiging ongedaan maken"
              tone="ghost"
              onPress={() =>
                portal.confirm({
                  title: 'Bevestiging ongedaan maken?',
                  message: `${lessonName}. De afgeschreven strippen komen terug en je kunt de lijst weer aanpassen.`,
                  confirmLabel: 'Ongedaan maken',
                  onConfirm: () => schedule.undoConfirmation(session.id, date),
                })
              }
            />
          </View>
        </>
      );
    } else {
      const list = schedule.attendanceList(session.id, date);
      const presentCount = list.filter((p) => p.present).length;
      const addable = students.filter((u) => !list.some((p) => p.id === u.email)).sort((a, b) => a.name.localeCompare(b.name));
      const stripsOf = (p: AttendanceEntry) =>
        p.usesApp ? (users.find((u) => u.email === p.id)?.strippen ?? 0) : ((schedule.data.roster[session.id] ?? []).find((e) => e.id === p.id)?.strips ?? 0);

      const addKlant = () => {
        const user = students.find((u) => u.email === addEmail);
        if (!user) return portal.toast('Kies eerst een klant');
        schedule.addAttendee(session.id, date, { id: user.email, name: user.name, usesApp: true });
        setAddEmail('');
      };
      const addWalkIn = () => {
        const name = walkIn.trim();
        if (!name) return portal.toast('Vul een naam in');
        schedule.addAttendee(session.id, date, { id: `w-${Date.now()}`, name, usesApp: false, walkIn: true });
        setWalkIn('');
      };

      body = (
        <>
          <Note
            text="Volgens de planning staan deze mensen ingepland. Zet uit wie er niet is en voeg toe wie er extra is. De strippen gaan pas af als je bevestigt."
            style={{ marginBottom: 12 }}
          />
          {list.length ? (
            list.map((p) => {
              const [label, tone] = typeTag(p);
              return (
                <Row key={p.id} dim={!p.present}>
                  <IconBtn label={p.present ? '✓' : ''} active={p.present} title="Aanwezig" onPress={() => schedule.setPresent(session.id, date, p.id, !p.present)} />
                  <Meta title={p.name} detail={[p.walkIn ? 'losse deelnemer' : `${stripsOf(p)} strippen`, p.present ? '' : 'afwezig'].filter(Boolean).join(' · ')} />
                  <Pill label={label} tone={tone} />
                  {p.planned ? null : <Pill label="toegevoegd" tone="pending" />}
                  {p.planned ? null : <IconBtn label="✕" danger title="Verwijderen" onPress={() => schedule.removeAttendee(session.id, date, p.id)} />}
                </Row>
              );
            })
          ) : (
            <Empty text="Niemand ingepland." />
          )}
          <View style={[portalStyles.form, { marginTop: 14 }]}>
            {addable.length ? (
              <Field label="Klant toevoegen">
                <View style={s.row}>
                  <Select value={addEmail} onChange={setAddEmail} options={[['', 'Kies een klant…'], ...addable.map((u): [string, string] => [u.email, u.name])]} style={{ flex: 1 }} />
                  <Btn label="Toevoegen" onPress={addKlant} />
                </View>
              </Field>
            ) : null}
            <Field label="Losse deelnemer">
              <View style={s.row}>
                <Input value={walkIn} onChange={setWalkIn} placeholder="Naam" style={{ flex: 1 }} onEnter={addWalkIn} />
                <Btn label="Toevoegen" onPress={addWalkIn} />
              </View>
            </Field>
          </View>
          <View style={[s.row, { marginTop: 16 }]}>
            <Btn
              label={`Bevestig presentie (${presentCount} aanwezig)`}
              tone="primary"
              disabled={!started}
              onPress={() =>
                portal.confirm({
                  title: 'Presentie bevestigen?',
                  message: `${lessonName}: ${presentCount} aanwezig, ${list.length - presentCount} afwezig. Bij elke aanwezige gaat nu één strip van de kaart.`,
                  confirmLabel: 'Bevestigen',
                  onConfirm: () => {
                    schedule.confirmAttendance(session.id, date);
                    portal.toast('Presentie bevestigd ✓');
                  },
                })
              }
            />
            {started ? null : <Note text={`Bevestigen kan vanaf ${startTimeOf(session)}.`} />}
          </View>
        </>
      );
    }
  }

  return (
    <View>
      <PageHeader title="Presentielijst" subtitle="Controleer wie er echt was. Pas na bevestigen worden de strippenkaarten bijgewerkt.">
        <Input
          type="date"
          value={date}
          onChange={(v) => {
            if (!v) return;
            setDate(v);
            setPicked('');
          }}
        />
        <Btn
          label="Vandaag"
          onPress={() => {
            setDate(schedule.today);
            setPicked('');
          }}
        />
      </PageHeader>
      <View style={portalStyles.grid2}>
        <Card style={[portalStyles.col, { flexBasis: 560, flexGrow: 1.4 }]}>
          {lessons.length && session ? (
            <Segmented
              options={lessons.map((x): [string, string] => [x.id, `${startTimeOf(x)} ${styleMeta[x.style].label}${schedule.confirmationOf(x.id, date) ? ' ✓' : ''}`])}
              value={session.id}
              onChange={setPicked}
            />
          ) : null}
          {body}
        </Card>
        <Card title="Nog te bevestigen" note="laatste 14 dagen" style={portalStyles.col}>
          {todo.length ? (
            todo.map((l) => (
              <Row
                key={`${l.session.id}@${l.date}`}
                onPress={() => {
                  setDate(l.date);
                  setPicked(l.session.id);
                }}>
                <StyleDot style={l.session.style} />
                <Meta title={dateLabel(l.date)} detail={`${styleMeta[l.session.style].label} · ${l.session.time}`} />
                {l.date === date && l.session.id === session?.id ? <Pill label="open" tone="pending" /> : null}
              </Row>
            ))
          ) : (
            <Empty text="Alles is bevestigd." />
          )}
        </Card>
      </View>
    </View>
  );
}
