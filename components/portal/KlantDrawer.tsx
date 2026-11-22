import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Drawer, ErrorText, Field, Input, KV, Meta, Note, Pill, portalStyles, Preview, Row, s, Select, StyleDot, ValidityPill } from '@/components/portal/ui';
import type { TagTone } from '@/components/portal/ui';
import Stepper from '@/components/Stepper';
import { styleMeta } from '@/constants/theme';
import type { Lesson } from '@/contexts/ScheduleContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { CARD_SIZE, useUsers } from '@/contexts/UsersContext';
import type { Session } from '@/data/schedule';
import Avatar from '@/components/Avatar';
import { addressOf, hasEmail, ORIGIN_LABEL, ORIGIN_TONE, shownEmail } from '@/data/users';
import { dateLabel, shortDate } from '@/lib/dutchDate';
import type { StripEvent } from '@/lib/remote';
import { loadStripEvents } from '@/lib/remote';
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
  const { users, adjustStrip, activateCard, deleteCustomer, adjustPrivateStrips, updateCustomer, setCardValidUntil } = useUsers();
  const [validDate, setValidDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ name: string; email: string; phone: string; address: string; postcode: string; city: string } | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const portal = usePortal();
  const [sessionId, setSessionId] = useState('');
  const [from, setFrom] = useState(schedule.today);
  const [weeks, setWeeks] = useState(String(ONGOING_WEEKS));
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<StripEvent[]>([]);
  const [showAll, setShowAll] = useState(false);
  const found = users.find((u) => u.email === email);
  // Reload the strip history whenever the balance changes (after + / − / new card).
  useEffect(() => {
    if (!found) return;
    let live = true;
    loadStripEvents(found.id).then((e) => live && setEvents(e));
    return () => {
      live = false;
    };
  }, [found?.id, found?.strippen, found?.privateStrips]);

  const user = users.find((u) => u.email === email);
  if (!user) return null;
  const { today, data } = schedule;
  const all = schedule.myLessons(email, '2000-01-01', horizonEnd(schedule.now));
  const past = all.filter((l) => schedule.isPast(l.session, l.date) && l.status.source !== 'aanvraag');
  const pastPrivates = schedule.privatesOf(email).filter((p) => p.date < today || (p.date === today && p.time.replace(':', '.') <= schedule.now.toTimeString().slice(0, 5).replace(':', '.')));
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
  const standingText = current
    .map((e) => {
      const x = schedule.sessionById(e.sessionId)!;
      return `${weekLabel(x)} · ${e.weeks >= ONGOING_WEEKS ? 'doorlopend' : `t/m ${shortDate(lastLessonOf(e))}`}`;
    })
    .join(' en ');

  // One timeline, newest first: lessons taken, cancellations, private lessons and strips added.
  const stamp = (date: string, time: string) => `${date}T${time.replace('.', ':').slice(0, 5)}`;
  const localStamp = (iso: string) => {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const charged = past.filter((l) => {
    if (l.closure) return false;
    if (l.status.cancelled) return !!schedule.cancellationOf(email, l.session.id, l.date)?.charged;
    return schedule.chargeFor(email, l.session.id, l.date) === 'strip';
  }).length;
  const freeCancels = past.filter((l) => !l.closure && l.status.cancelled && !schedule.cancellationOf(email, l.session.id, l.date)?.charged).length;
  const added = events.filter((e) => e.card === 'groep' && e.kind !== 'vervallen').reduce((n, e) => n + e.delta, 0);
  const timeline = [
    ...past.map((l) => ({ key: `l:${l.session.id}@${l.date}`, at: stamp(l.date, l.session.time), node: lessonRow(l, true) })),
    ...pastPrivates.map((p) => ({
      key: `p:${p.id}`,
      at: stamp(p.date, p.time),
      node: (
        <Row key={`p:${p.id}`}>
          <Meta title={dateLabel(p.date)} detail={`Privéles · ${p.time}`} />
          <Pill label={p.cancelled ? 'Privéles afgemeld' : 'Privéles'} tone={p.cancelled ? 'muted' : 'ink'} />
        </Row>
      ),
    })),
    ...events.map((e) => {
      const at = localStamp(e.at);
      const what = e.card === 'prive'
        ? e.kind === 'kaart' ? 'Nieuwe privé-strippenkaart' : e.delta > 0 ? 'Privéstrippen erbij' : 'Privéstrip eraf'
        : e.kind === 'vervallen' ? 'Strippen vervallen (einddatum verstreken)' : e.kind === 'kaart' ? 'Nieuwe strippenkaart' : e.delta > 0 ? 'Strippen erbij' : 'Strip eraf (correctie)';
      return {
        key: `e:${e.id}`,
        at,
        node: (
          <Row key={`e:${e.id}`}>
            <Meta title={dateLabel(at.slice(0, 10))} detail={`${what} · ${at.slice(11).replace(':', '.')} · daarna ${e.balance} ${e.card === 'prive' ? 'privéstrippen' : 'strippen'}`} />
            <Pill label={`${e.delta > 0 ? '+' : '−'}${Math.abs(e.delta)} ${Math.abs(e.delta) === 1 ? 'strip' : 'strippen'}`} tone={e.delta > 0 ? 'teal' : 'rani'} />
          </Row>
        ),
      };
    }),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const shown = showAll ? timeline : timeline.slice(0, 25);

  return (
    <Drawer eyebrow="Klant" title={user.name} subtitle={[shownEmail(user.email), user.phone].filter(Boolean).join(' · ')} onClose={portal.closeDrawer}>
      {editing ? (
        <Card title="Gegevens aanpassen">
          <View style={portalStyles.form}>
            <Field label="Naam" style={portalStyles.full}>
              <Input value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            </Field>
            <Field label={hasEmail(user.email) ? 'E-mailadres' : 'E-mailadres (optioneel)'}>
              <Input type="email" value={editing.email} onChange={(v) => setEditing({ ...editing, email: v })} />
            </Field>
            <Field label="Telefoon">
              <Input value={editing.phone} onChange={(v) => setEditing({ ...editing, phone: v })} />
            </Field>
            <Field label="Adres (optioneel)" style={portalStyles.full}>
              <Input value={editing.address} placeholder="Straat en huisnummer" onChange={(v) => setEditing({ ...editing, address: v })} />
            </Field>
            <Field label="Postcode">
              <Input value={editing.postcode} placeholder="1234 AB" onChange={(v) => setEditing({ ...editing, postcode: v })} />
            </Field>
            <Field label="Plaats">
              <Input value={editing.city} placeholder="Berghem" onChange={(v) => setEditing({ ...editing, city: v })} />
            </Field>
            {hasEmail(user.email) && editing.email.trim().toLowerCase() !== user.email ? (
              <View style={portalStyles.full}>
                <Note text="De klant logt daarna in met het nieuwe e-mailadres. Het wachtwoord blijft hetzelfde." />
              </View>
            ) : null}
            {editError ? (
              <View style={portalStyles.full}>
                <ErrorText text={editError} />
              </View>
            ) : null}
            <View style={[portalStyles.full, s.row]}>
              <Btn
                label="Opslaan"
                tone="primary"
                onPress={async () => {
                  if (!editing.name.trim()) return setEditError('Vul een naam in.');
                  setEditError(null);
                  const newEmail = editing.email.trim().toLowerCase();
                  if (
                    !(await updateCustomer(email, {
                      name: editing.name.trim(),
                      phone: editing.phone.trim(),
                      email: newEmail,
                      address: editing.address.trim(),
                      postcode: editing.postcode.trim(),
                      city: editing.city.trim(),
                    }))
                  )
                    return;
                  setEditing(null);
                  portal.toast('Gegevens opgeslagen ✓');
                  if (newEmail && newEmail !== email) portal.openKlant(newEmail);
                }}
              />
              <Btn label="Annuleren" onPress={() => setEditing(null)} />
            </View>
          </View>
        </Card>
      ) : null}
      <Card>
        <View style={[s.row, { marginBottom: 10, alignItems: 'center' }]}>
          <Pressable onPress={() => user.avatarPath && setPhotoOpen(!photoOpen)} disabled={!user.avatarPath} accessibilityLabel="Profielfoto bekijken">
            <Avatar path={user.avatarPath} name={user.name} size={photoOpen ? 220 : 56} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Meta title={user.phone || 'Geen telefoonnummer'} detail={addressOf(user) || 'Geen adres'} />
            {user.avatarPath ? (
              <View style={{ marginTop: 6, alignItems: 'flex-start' }}>
                <Btn label={photoOpen ? 'Foto verkleinen' : '🔍 Foto vergroten'} small onPress={() => setPhotoOpen(!photoOpen)} />
              </View>
            ) : null}
          </View>
        </View>
        <KV label="Strippen">
          <View style={s.row}>
            <Stepper value={user.strippen ?? 0} onChange={(d) => adjustStrip(email, d)} />
            <Btn label="+10 nieuwe kaart" tone="teal" small onPress={askCard} />
            {user.strippen !== null ? <ValidityPill validUntil={user.stripsValidUntil} today={schedule.today} /> : null}
          </View>
        </KV>
        {user.strippen !== null ? (
          <KV label="Geldig t/m">
            <View style={s.row}>
              <Input type="date" value={validDate ?? user.stripsValidUntil ?? ''} onChange={setValidDate} style={{ padding: '4px 6px', fontSize: 12.5 }} />
              {validDate && validDate !== user.stripsValidUntil ? (
                <Btn
                  label="Opslaan"
                  tone="primary"
                  small
                  onPress={async () => {
                    if (await setCardValidUntil(email, validDate)) {
                      setValidDate(null);
                      portal.toast('Einddatum opgeslagen ✓');
                    }
                  }}
                />
              ) : null}
            </View>
          </KV>
        ) : null}
        {user.privateStrips !== null ? (
          <KV label="Privéstrippen">
            <View style={s.row}>
              <Stepper value={user.privateStrips} onChange={(d) => adjustPrivateStrips(email, d)} />
            </View>
          </KV>
        ) : null}
        <KV label="Vaste groepsles">{standing ? standingText : '—'}</KV>
        <KV label="Algemene voorwaarden">
          {user.termsAcceptedAt ? <Pill label={`✓ ${user.termsAcceptedAt}`} tone="teal" /> : <Pill label="Nog niet akkoord" tone="rani" />}
        </KV>
        <KV label="Openstaande lessen">{open || '—'}</KV>
        <KV label="Herkomst">
          <Pill label={ORIGIN_LABEL[user.origin]} tone={ORIGIN_TONE[user.origin]} />
        </KV>
        <View style={[s.row, { marginTop: 8 }]}>
          <Btn
            label="✏️ Gegevens aanpassen"
            small
            onPress={() =>
              setEditing({
                name: user.name,
                email: hasEmail(user.email) ? user.email : '',
                phone: user.phone ?? '',
                address: user.address ?? '',
                postcode: user.postcode ?? '',
                city: user.city ?? '',
              })
            }
          />
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

      <Card title="Afgenomen" note={`${charged} met strip · ${freeCancels} afgemeld zonder strip`}>
        <Note
          text={`Nu ${user.strippen ?? 0} ${user.strippen === 1 ? 'strip' : 'strippen'}${user.privateStrips !== null ? ` en ${user.privateStrips} privéstrippen` : ''}. ${
            standing ? `Vast op ${standingText}.` : 'Geen vaste groepsles.'
          } Door beheer toegevoegd: ${added} strippen.`}
          style={{ marginBottom: 8 }}
        />
        {shown.length ? shown.map((x) => x.node) : <Note text="Nog geen lessen afgenomen." />}
        {timeline.length > shown.length ? (
          <View style={{ marginTop: 8 }}>
            <Btn label={`Toon alles (${timeline.length})`} small onPress={() => setShowAll(true)} />
          </View>
        ) : null}
        <Note text="Strippen die erbij of eraf gaan worden bijgehouden vanaf 22 november 2026." style={{ marginTop: 8 }} />
      </Card>
    </Drawer>
  );
}
