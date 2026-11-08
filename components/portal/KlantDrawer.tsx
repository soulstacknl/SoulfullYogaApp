import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Drawer, ErrorText, Field, Input, KV, Meta, Note, Pill, portalStyles, Preview, Row, s, Select, StyleDot, ValidityPill } from '@/components/portal/ui';
import type { TagTone } from '@/components/portal/ui';
import Stepper from '@/components/Stepper';
import { styleMeta } from '@/constants/theme';
import type { Lesson } from '@/contexts/ScheduleContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { CARD_SIZE, useUsers } from '@/contexts/UsersContext';
import type { Session } from '@/data/schedule';
import { ORIGIN_LABEL, ORIGIN_TONE, shownEmail } from '@/data/users';
import { dateLabel, shortDate } from '@/lib/dutchDate';
import { enrollmentOf, horizonEnd, isExtra, lastLessonOf, nextOccurrence, ONGOING_WEEKS, openChargeCount, startTimeOf } from '@/lib/schedule';

export const weekLabel = (s: Session) => `${s.day} ${startTimeOf(s)} · ${styleMeta[s.style].label}`;

// Weekly sessions that still run, Monday first.
export function weeklySessions(sessions: Session[], today: string) {
  const order = (s: Session) => ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'].indexOf(s.day);
  return sessions
    .filter((s) => !isExtra(s) && (!s.until || s.until >= today))
    .sort((a, b) => order(a) - order(b) || a.time.localeCompare(b.time));
}

// One customer: strips, standing lessons (add / stop) and their lessons.
export default function KlantDrawer({ email }: { email: string }) {
  const schedule = useSchedule();
  const { users, adjustStrip, activateCard, deleteCustomer, adjustPrivateStrips } = useUsers();
  const portal = usePortal();
  const [sessionId, setSessionId] = useState('');
  const [from, setFrom] = useState(schedule.today);
  const [weeks, setWeeks] = useState(String(ONGOING_WEEKS));
  const [error, setError] = useState<string | null>(null);

  const user = users.find((u) => u.email === email);
  if (!user) return null;
  const { today, data } = schedule;
  const all = schedule.myLessons(email, '2000-01-01', horizonEnd(schedule.now));
  const upcoming = all.filter((l) => !schedule.isPast(l.session, l.date)).slice(0, 8);
  const past = all.filter((l) => schedule.isPast(l.session, l.date) && l.status.source !== 'aanvraag').reverse().slice(0, 10);
  const current = schedule.activeEnrollmentsOf(email);
  const open = openChargeCount(data, email);
  const chosen = schedule.sessionById(sessionId);
  const first = chosen ? nextOccurrence(chosen, from || today) : null;
  const weeksN = Math.max(1, Number(weeks) || 1);

  const askCard = () =>
    portal.confirm({
      title: 'Nieuwe strippenkaart?',
      message: `${user.name} krijgt een nieuwe 10-strippenkaart: ${user.strippen ?? 0} → ${(user.strippen ?? 0) + CARD_SIZE} strippen.`,
      confirmLabel: 'Activeren',
      onConfirm: () => activateCard(email),
    });

  const planStanding = () => {
    if (!chosen) return setError('Kies eerst een les.');
    if (!first) return setError('Deze les wordt in die week niet gegeven.');
    if (enrollmentOf(data, email, chosen.id, first)) return setError(`${user.name} staat al vast op deze les.`);
    if (!schedule.addStanding(chosen.id, first, email, weeksN)) return setError(`De les op ${dateLabel(first)} is vol.`);
    setSessionId('');
    setFrom(today);
    setWeeks(String(ONGOING_WEEKS));
    setError(null);
    portal.toast('Groepsles ingepland ✓');
  };

  // Everything still to come of this standing lesson disappears from the schedule.
  const askStop = (enrollmentId: string) => {
    const enrollment = current.find((e) => e.id === enrollmentId)!;
    const session = schedule.sessionById(enrollment.sessionId)!;
    const vanishing = schedule.upcomingStandingDates(enrollment);
    const n = vanishing.length;
    portal.confirm({
      title: 'Groepsles stoppen?',
      message: `${user.name} stopt met ${weekLabel(session)}${n ? ` vanaf ${dateLabel(vanishing[0])}` : ''}. ${
        n ? `${n} komende ${n === 1 ? 'les verdwijnt' : 'lessen verdwijnen'} uit de planning en het rooster` : 'Er staan geen komende lessen meer'
      }. Eerdere lessen blijven staan.`,
      confirmLabel: 'Stoppen',
      onConfirm: () => {
        schedule.stopStanding(enrollmentId);
        portal.toast(`Groepsles gestopt · ${n} ${n === 1 ? 'les' : 'lessen'} uit de planning`);
      },
    });
  };

  const lessonRow = (l: Lesson, isPast: boolean) => {
    let tag: [string, TagTone];
    if (l.closure) tag = ['Vervalt', 'muted'];
    else if (l.status.cancelled) {
      tag = schedule.cancellationOf(email, l.session.id, l.date)?.charged ? ['Afgemeld < 24 uur · −1 strip', 'rani'] : ['Afgemeld', 'muted'];
    }
    else if (isPast) {
      const c = schedule.chargeFor(email, l.session.id, l.date);
      tag = c === undefined ? ['Te bevestigen', 'pending'] : c === 'afwezig' ? ['Afwezig', 'muted'] : c === 'open' ? ['Openstaand', 'rani'] : c === 'los' ? ['Losse les', 'ink'] : ['−1 strip', 'teal'];
    } else {
      tag = l.status.source === 'aanvraag' ? ['Aanvraag', 'pending'] : l.status.source === 'vast' ? ['Groepsles', 'teal'] : ['Losse les', 'ink'];
    }
    return (
      <Row key={`${l.session.id}@${l.date}`}>
        <StyleDot style={l.session.style} />
        <Meta title={dateLabel(l.date)} detail={`${styleMeta[l.session.style].label} · ${l.session.time}`} />
        <Pill label={tag[0]} tone={tag[1]} />
      </Row>
    );
  };

  const standing = current[0] && schedule.sessionById(current[0].sessionId);

  return (
    <Drawer eyebrow="Klant" title={user.name} subtitle={[shownEmail(user.email), user.phone].filter(Boolean).join(' · ')} onClose={portal.closeDrawer}>
      <Card>
        <KV label="Strippen">
          <View style={s.row}>
            <Stepper value={user.strippen ?? 0} onChange={(d) => adjustStrip(email, d)} />
            <Btn label="+10 nieuwe kaart" tone="teal" small onPress={askCard} />
            {user.strippen !== null ? <ValidityPill validUntil={user.stripsValidUntil} today={schedule.today} /> : null}
          </View>
        </KV>
        {user.privateStrips !== null ? (
          <KV label="Privéstrippen">
            <View style={s.row}>
              <Stepper value={user.privateStrips} onChange={(d) => adjustPrivateStrips(email, d)} />
            </View>
          </KV>
        ) : null}
        <KV label="Groepsles">{standing ? `${standing.day} ${startTimeOf(standing)}` : '—'}</KV>
        <KV label="Algemene voorwaarden">
          {user.termsAcceptedAt ? <Pill label={`✓ ${user.termsAcceptedAt}`} tone="teal" /> : <Pill label="Nog niet akkoord" tone="rani" />}
        </KV>
        <KV label="Openstaande lessen">{open || '—'}</KV>
        <KV label="Herkomst">
          <Pill label={ORIGIN_LABEL[user.origin]} tone={ORIGIN_TONE[user.origin]} />
        </KV>
        <View style={[s.row, { marginTop: 8 }]}>
          <Btn
            label={`💬 Chat met ${user.name.split(' ')[0]}`}
            small
            onPress={() => {
              portal.closeDrawer();
              router.navigate({ pathname: '/portal/berichten', params: { klant: user.id } });
            }}
          />
          <Btn
            label="Klant verwijderen"
            small
            tone="ghost"
            onPress={() =>
              portal.confirm({
                title: `${user.name} verwijderen?`,
                message: 'De klant, de strippenkaart, lessen en chatberichten worden definitief verwijderd. Dit kan niet ongedaan worden gemaakt.',
                confirmLabel: 'Verwijderen',
                onConfirm: async () => {
                  if (await deleteCustomer(user.email)) {
                    portal.closeDrawer();
                    portal.toast(`${user.name} verwijderd`);
                  }
                },
              })
            }
          />
        </View>
      </Card>

      <Card title="Groepsles" note={current.length ? `${current.length} actief` : 'geen'}>
        {current.map((e) => {
          const session = schedule.sessionById(e.sessionId)!;
          return (
            <Row key={e.id}>
              <StyleDot style={session.style} />
              <Meta title={weekLabel(session)} detail={`vanaf ${shortDate(e.start)} · ${e.weeks >= ONGOING_WEEKS ? 'doorlopend' : `t/m ${shortDate(lastLessonOf(e))}`}`} />
              <Btn label="Stoppen" tone="ghost" small onPress={() => askStop(e.id)} />
            </Row>
          );
        })}
        <View style={[portalStyles.form, { marginTop: current.length ? 14 : 0 }]}>
          <Field label="Les uit het weekrooster" style={portalStyles.full}>
            <Select
              value={sessionId}
              onChange={(v) => {
                setSessionId(v);
                setError(null);
              }}
              options={[['', 'Kies een les…'], ...weeklySessions(data.sessions, today).map((x): [string, string] => [x.id, weekLabel(x)])]}
            />
          </Field>
          <Field label="Vanaf">
            <Input type="date" value={from} min={today} onChange={(v) => { setFrom(v); setError(null); }} />
          </Field>
          <Field label="Aantal weken">
            <Input type="number" min="1" value={weeks} onChange={setWeeks} />
          </Field>
          {chosen && first ? (
            <View style={portalStyles.full}>
              <Preview
                text={`Eerste les: ${dateLabel(first)} · daarna elke ${chosen.day.toLowerCase()}${weeksN >= ONGOING_WEEKS ? ', doorlopend' : `, ${weeksN} weken`}. Vrije plekken die dag: ${schedule.occupancy(chosen.id, first).available}.`}
              />
            </View>
          ) : null}
          {error ? (
            <View style={portalStyles.full}>
              <ErrorText text={error} />
            </View>
          ) : null}
          <View style={[portalStyles.full, s.row]}>
            <Btn label="Vast inplannen" tone="primary" onPress={planStanding} />
            <Note text={`${ONGOING_WEEKS} weken = doorlopend`} />
          </View>
        </View>
      </Card>

      <Card title="Komende lessen">{upcoming.length ? upcoming.map((l) => lessonRow(l, false)) : <Note text="Niets ingepland." />}</Card>
      <Card title="Afgenomen">{past.length ? past.map((l) => lessonRow(l, true)) : <Note text="Nog geen lessen afgenomen." />}</Card>
    </Drawer>
  );
}
