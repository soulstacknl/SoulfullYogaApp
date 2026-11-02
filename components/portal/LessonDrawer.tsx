import { useState } from 'react';
import { View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Drawer, Field, IconBtn, Input, KV, Meta, Meter, Note, Pill, portalStyles, Row, s, Select } from '@/components/portal/ui';
import Stepper from '@/components/Stepper';
import WeeksPrompt from '@/components/WeeksPrompt';
import { styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { LessonStatus } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import type { AppUser } from '@/data/users';
import { dateLabel, daysBetween, shortDate } from '@/lib/dutchDate';
import { enrollmentOf, isExtra, ONGOING_WEEKS } from '@/lib/schedule';

function SourceTag({ status, date }: { status: LessonStatus; date: string }) {
  if (status.source === 'aanvraag') return <Pill label="Aanvraag" tone="pending" />;
  if (status.source !== 'vast' || !status.enrollment) return <Pill label="Losse les" tone="ink" />;
  const e = status.enrollment;
  const left = e.weeks - daysBetween(e.start, date) / 7;
  return <Pill label={e.weeks >= ONGOING_WEEKS ? 'Vaste klant' : `Vaste klant · nog ${left} wk`} tone="teal" />;
}

// One lesson date: occupancy, capacity, participants and adding a standing customer.
export default function LessonDrawer({ sessionId, date }: { sessionId: string; date: string }) {
  const schedule = useSchedule();
  const { students } = useUsers();
  const portal = usePortal();
  const [pick, setPick] = useState('');
  const [weeks, setWeeks] = useState(String(ONGOING_WEEKS));
  const [removing, setRemoving] = useState<AppUser | null>(null);

  const session = schedule.sessionById(sessionId);
  if (!session) return null;
  const occupancy = schedule.occupancy(sessionId, date);
  const closure = schedule.closureOf(sessionId, date);
  const started = schedule.hasStarted(session, date);
  const attending = schedule.attendees(sessionId, date);
  const cancelled = students.filter((u) => schedule.statusFor(u.email, sessionId, date)?.cancelled);
  const pickable = students.filter((u) => !enrollmentOf(schedule.data, u.email, sessionId, date)).sort((a, b) => a.name.localeCompare(b.name));
  const single = closure && closure.from === closure.to && closure.sessionId === sessionId;
  const lessonName = `${styleMeta[session.style].label} · ${dateLabel(date)} · ${session.time}`;
  const withoutApp = (schedule.data.roster[sessionId] ?? []).length;

  const askRemove = (user: AppUser, status: LessonStatus) => {
    if (status.source === 'vast') return setRemoving(user);
    portal.confirm({
      title: `${user.name} afmelden?`,
      message: `Losse les ${lessonName}. De plek komt weer vrij.`,
      confirmLabel: 'Afmelden',
      onConfirm: () => schedule.cancelLesson(user.email, sessionId, date, 'beheer'),
    });
  };

  const addStanding = () => {
    if (!pick) return portal.toast('Kies eerst een klant');
    if (schedule.addStanding(sessionId, date, pick, Math.max(1, Number(weeks) || 1))) {
      setPick('');
      setWeeks(String(ONGOING_WEEKS));
      portal.toast('Vaste klant ingepland ✓');
    }
  };

  return (
    <Drawer
      eyebrow={`${styleMeta[session.style].label}${isExtra(session) ? ' · extra les' : ''}`}
      title={dateLabel(date)}
      subtitle={`${session.time} · Berghem`}
      onClose={portal.closeDrawer}>
      {closure ? (
        <Card>
          <KV label="Deze les vervalt">
            <Pill label={closure.reason} tone="muted" />
          </KV>
          {single ? (
            <View style={{ marginTop: 8, flexDirection: 'row' }}>
              <Btn label="Les toch laten doorgaan" tone="teal" onPress={() => schedule.removeClosure(closure.id)} />
            </View>
          ) : (
            <Note text={`Onderdeel van ${closure.reason} (${shortDate(closure.from)} – ${shortDate(closure.to)}). Aanpassen via Rooster beheren.`} style={{ marginTop: 6 }} />
          )}
        </Card>
      ) : (
        <Card>
          <KV label="Bezetting">
            <View style={{ width: 200, flexDirection: 'row' }}>
              <Meter occupancy={occupancy} />
            </View>
          </KV>
          <KV label="Plekken op deze datum">
            <Stepper value={occupancy.capacity} onChange={(d) => schedule.adjustCapacity(sessionId, date, d)} />
          </KV>
          <KV label="Vrij">{occupancy.available}</KV>
          <View style={[s.row, { marginTop: 10 }]}>
            <Btn label="✅ Presentielijst" onPress={() => portal.toPresentie(sessionId, date)} />
            {!started ? (
              <Btn
                label="Les laten vervallen"
                tone="ghost"
                onPress={() =>
                  portal.confirm({
                    title: 'Les laten vervallen?',
                    message: `${lessonName}. Wie ingepland staat ziet "Vervalt" en krijgt geen strip afgeschreven.`,
                    confirmLabel: 'Laten vervallen',
                    onConfirm: () => schedule.addClosure({ from: date, to: date, sessionId, reason: 'Les vervalt' }),
                  })
                }
              />
            ) : null}
          </View>
        </Card>
      )}

      <Card title="Deelnemers" note={`${attending.length} met de app · ${withoutApp} zonder`}>
        {attending.length ? (
          attending.map(({ person, status }) => {
            const user = students.find((u) => u.email === person.email)!;
            return (
              <Row key={person.email} onPress={() => portal.openKlant(person.email, true)}>
                <Meta title={`${user.name} ›`} detail={`${user.strippen === null ? 'geen kaart' : `${user.strippen} strippen`} · ${user.email}`} />
                <SourceTag status={status} date={date} />
                {!started && status.source !== 'aanvraag' ? <IconBtn label="✕" danger title="Afmelden" onPress={() => askRemove(user, status)} /> : null}
              </Row>
            );
          })
        ) : (
          <Note text="Nog geen app-klanten ingepland." />
        )}
        {cancelled.map((u) => (
          <Row key={u.email} dim onPress={() => portal.openKlant(u.email, true)}>
            <Meta title={`${u.name} ›`} />
            {schedule.cancellationOf(u.email, sessionId, date)?.charged ? (
              <Pill label="Afgemeld < 24 uur · −1 strip" tone="rani" />
            ) : (
              <Pill label="Afgemeld" tone="muted" />
            )}
          </Row>
        ))}
      </Card>

      {!closure && !started ? (
        <Card title="Vaste klant inplannen" note={`vanaf ${shortDate(date)}`}>
          {occupancy.available > 0 && pickable.length ? (
            <>
              <View style={portalStyles.form}>
                <Field label="Klant" style={portalStyles.full}>
                  <Select value={pick} onChange={setPick} options={[['', 'Kies een klant…'], ...pickable.map((u): [string, string] => [u.email, u.name])]} />
                </Field>
                <Field label="Aantal weken">
                  <Input type="number" min="1" value={weeks} onChange={setWeeks} />
                </Field>
                <View style={{ justifyContent: 'flex-end', flexGrow: 1, flexBasis: 160, flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Btn label="Inplannen" tone="primary" onPress={addStanding} />
                </View>
              </View>
              <Note text={`${ONGOING_WEEKS} weken = doorlopende vaste les.`} style={{ marginTop: 8 }} />
            </>
          ) : (
            <Note text={occupancy.available <= 0 ? 'Deze les is vol.' : 'Alle klanten zijn al vaste klant.'} />
          )}
        </Card>
      ) : null}

      {/* Mounted only while open, so it stacks above the side panel. */}
      {removing ? (
      <WeeksPrompt
        visible
        title={`${removing.name} afmelden voor hoeveel weken?`}
        hint={`Kies ${ONGOING_WEEKS} om de vaste les helemaal te stoppen.`}
        confirmLabel="Afmelden"
        onCancel={() => setRemoving(null)}
        onConfirm={(n) => {
          if (removing) {
            const result = schedule.removeStanding(sessionId, date, removing.email, n);
            portal.toast(result === 'gestopt' ? `${removing.name}: vaste les gestopt` : `${removing.name} afgemeld`);
          }
          setRemoving(null);
        }}
      />
      ) : null}
    </Drawer>
  );
}
