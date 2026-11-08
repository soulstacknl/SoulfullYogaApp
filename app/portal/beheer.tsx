import { useState } from 'react';
import { Text, View } from 'react-native';

import { weekLabel, weeklySessions } from '@/components/portal/KlantDrawer';
import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Chip, Empty, ErrorText, Field, IconBtn, Input, KV, Meta, PageHeader, Pill, portalStyles, Preview, Row, s, Segmented, Select, StyleDot } from '@/components/portal/ui';
import Stepper from '@/components/Stepper';
import { styleMeta } from '@/constants/theme';
import type { ClassStyle } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { dateLabel, plusDays, shortDate, toDate, WEEKDAYS, weekdayOf } from '@/lib/dutchDate';
import { isActiveEnrollment, isExtra, startTimeOf } from '@/lib/schedule';

type Kind = 'vast' | 'extra' | 'prive' | 'vervallen';
const DAYS = [...WEEKDAYS.slice(1), WEEKDAYS[0]]; // Monday first

// Weekly schedule, extra lessons, private lessons and holidays.
export default function PortalBeheer() {
  const schedule = useSchedule();
  const portal = usePortal();
  const { users } = useUsers();
  const privates = schedule.upcomingPrivates();
  const nameOf = (email: string) => users.find((u) => u.email === email)?.name ?? email;
  const { data, today } = schedule;
  const [stopDates, setStopDates] = useState<Record<string, string>>({});
  const [kind, setKind] = useState<Kind>('vast');
  const [scope, setScope] = useState('');

  const weekly = weeklySessions(data.sessions, today);
  const extras = data.sessions.filter((x) => isExtra(x) && x.from! >= today).sort((a, b) => a.from!.localeCompare(b.from!));
  const closures = data.closures.filter((c) => c.to >= today).sort((a, b) => a.from.localeCompare(b.from));
  const standingCount = (sessionId: string) =>
    new Set(data.enrollments.filter((e) => e.sessionId === sessionId && isActiveEnrollment(e, today)).map((e) => e.email)).size;

  return (
    <View>
      <PageHeader title="Rooster beheren" subtitle="Weekrooster, extra lessen, privélessen en vakanties." />
      <View style={portalStyles.grid2}>
        <View style={[portalStyles.col, { flexBasis: 560 }]}>
          <Card title="Weekrooster" note={`${weekly.length} groepslessen`}>
            {weekly.map((x) => (
              <Row key={x.id}>
                <StyleDot style={x.style} />
                <Meta
                  title={`${x.day} ${startTimeOf(x)}`}
                  detail={`${styleMeta[x.style].label} · ${x.time}${x.from && x.from > today ? ` · vanaf ${shortDate(x.from)}` : ''} · ${standingCount(x.id)} vaste klanten`}
                />
                <Stepper value={x.capacity} onChange={(d) => schedule.adjustDefaultCapacity(x.id, d)} />
                <View style={{ gap: 6, alignItems: 'flex-end' }}>
                  {x.until ? (
                    <View style={s.row}>
                      <Pill label={`laatste les ${shortDate(x.until)}`} tone="pending" />
                      <Btn label="Doorlopen" small onPress={() => schedule.setSessionUntil(x.id, null)} />
                    </View>
                  ) : (
                    <View style={s.row}>
                      <Input type="date" min={today} value={stopDates[x.id] ?? ''} onChange={(v) => setStopDates((p) => ({ ...p, [x.id]: v }))} style={{ padding: '4px 6px', fontSize: 12.5 }} />
                      <Btn
                        label="Stop na"
                        small
                        onPress={() => (stopDates[x.id] ? schedule.setSessionUntil(x.id, stopDates[x.id]) : portal.toast('Kies eerst de datum van de laatste les'))}
                      />
                    </View>
                  )}
                  <Btn
                    label="🌴 Vakantie"
                    small
                    onPress={() => {
                      setKind('vervallen');
                      setScope(x.id);
                    }}
                  />
                </View>
              </Row>
            ))}
          </Card>
          <Card title="Uitzonderingen">
            {closures.map((c) => (
              <Row key={c.id}>
                <Text style={{ fontSize: 18 }}>🌴</Text>
                <Meta
                  title={c.reason}
                  detail={`${c.from === c.to ? dateLabel(c.from) : `${shortDate(c.from)} – ${shortDate(c.to)}`} · ${
                    c.sessionId && schedule.sessionById(c.sessionId) ? `alleen ${weekLabel(schedule.sessionById(c.sessionId)!).toLowerCase()}` : 'alle lessen vervallen'
                  }`}
                />
                <IconBtn
                  label="✕"
                  danger
                  title="Verwijderen"
                  onPress={() =>
                    portal.confirm({
                      title: 'Uitzondering verwijderen?',
                      message: `${c.reason}. De lessen in deze periode gaan dan gewoon door.`,
                      confirmLabel: 'Verwijderen',
                      onConfirm: () => schedule.removeClosure(c.id),
                    })
                  }
                />
              </Row>
            ))}
            {extras.map((x) => (
              <Row key={x.id}>
                <StyleDot style={x.style} />
                <Meta title={`Extra: ${styleMeta[x.style].label}`} detail={`${dateLabel(x.from!)} · ${x.time} · ${x.capacity} plekken`} />
                <IconBtn
                  label="✕"
                  danger
                  title="Verwijderen"
                  onPress={() =>
                    portal.confirm({
                      title: 'Extra les verwijderen?',
                      message: `${styleMeta[x.style].label} · ${dateLabel(x.from!)} · ${x.time}. Aanvragen en boekingen voor deze les vervallen ook.`,
                      confirmLabel: 'Verwijderen',
                      onConfirm: () => schedule.removeExtraSession(x.id),
                    })
                  }
                />
              </Row>
            ))}
            {closures.length || extras.length ? null : <Empty text="Geen vakanties of extra lessen gepland." />}
          </Card>
          <Card title="Privélessen" note="geen strippen · de klant kan afmelden tot de les begint">
            {privates.map((p) => (
              <Row key={p.id}>
                <Meta title={nameOf(p.email)} detail={`${dateLabel(p.date)} · ${p.time}`} />
                <Pill label={p.cancelled ? 'Afgemeld door klant' : 'Privéles'} tone={p.cancelled ? 'muted' : 'rani'} />
                <IconBtn
                  label="✕"
                  danger
                  title="Verwijderen"
                  onPress={() =>
                    portal.confirm({
                      title: 'Privéles verwijderen?',
                      message: p.cancelled
                        ? `${nameOf(p.email)} had zich al afgemeld.`
                        : `${nameOf(p.email)} · ${dateLabel(p.date)} · ${p.time}. De klant krijgt een pushmelding dat de les niet doorgaat.`,
                      confirmLabel: 'Verwijderen',
                      onConfirm: () => schedule.removePrivateLesson(p.id),
                    })
                  }
                />
              </Row>
            ))}
            {privates.length ? null : <Empty text="Geen privélessen gepland." />}
          </Card>
        </View>
        <View style={[portalStyles.col, { flexBasis: 380 }]}>
          <Card title="Toevoegen">
            <Segmented<Kind>
              options={[['vast', 'Groepsles'], ['extra', 'Extra les'], ['prive', 'Privéles'], ['vervallen', 'Vakantie']]}
              value={kind}
              onChange={(k) => {
                setKind(k);
                setScope('');
              }}
            />
            {kind === 'vervallen' ? (
              <HolidayForm key={scope} initialScope={scope} />
            ) : kind === 'prive' ? (
              <PrivateForm />
            ) : (
              <LessonForm key={kind} extra={kind === 'extra'} />
            )}
          </Card>
        </View>
      </View>
    </View>
  );
}

// A private lesson with one customer: push to the customer, no strips.
function PrivateForm() {
  const schedule = useSchedule();
  const portal = usePortal();
  const { students } = useUsers();
  const { today } = schedule;
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(today);
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('11:00');
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const problem = !email
      ? 'Kies een klant.'
      : !date ? 'Kies een datum.' : date < today ? 'Die datum is al voorbij.' : !start || !end ? 'Vul een begin- en eindtijd in.' : end <= start ? 'De eindtijd moet na de begintijd liggen.' : toDate(date, start.replace(':', '.')) <= new Date() ? 'Dat tijdstip is al voorbij.' : '';
    if (problem) return setError(problem);
    schedule.addPrivateLesson(email, date, `${start.replace(':', '.')} – ${end.replace(':', '.')}`);
    setError(null);
    setEmail('');
    portal.toast('Privéles ingepland ✓ · de klant krijgt een pushmelding');
  };

  return (
    <View style={portalStyles.form}>
      <Field label="Klant" style={portalStyles.full}>
        <Select value={email} onChange={setEmail} options={[['', 'Kies een klant…'], ...students.map((u): [string, string] => [u.email, u.name])]} />
      </Field>
      <Field label="Datum" style={portalStyles.full}>
        <Input type="date" min={today} value={date} onChange={setDate} />
      </Field>
      <Field label="Begintijd">
        <Input type="time" value={start} onChange={setStart} />
      </Field>
      <Field label="Eindtijd">
        <Input type="time" value={end} onChange={setEnd} />
      </Field>
      {error ? (
        <View style={portalStyles.full}>
          <ErrorText text={error} />
        </View>
      ) : null}
      <View style={[portalStyles.full, { flexDirection: 'row' }]}>
        <Btn label="Privéles inplannen" tone="primary" onPress={save} />
      </View>
    </View>
  );
}

function HolidayForm({ initialScope }: { initialScope: string }) {
  const schedule = useSchedule();
  const portal = usePortal();
  const { today } = schedule;
  const [reason, setReason] = useState('Vakantie');
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(plusDays(today, 6));
  const [scope, setScope] = useState(initialScope);
  const [error, setError] = useState<string | null>(null);
  const preview = schedule.closurePreview(from, to, scope || null);

  const save = () => {
    if (!from || !to) return setError('Kies een begin- en einddatum.');
    if (to < from) return setError('De einddatum ligt vóór de begindatum.');
    schedule.addClosure({ from, to, sessionId: scope || null, reason: reason.trim() || 'Vakantie' });
    setError(null);
    setReason('Vakantie');
    portal.toast('Vakantie opgeslagen ✓');
  };

  return (
    <View style={portalStyles.form}>
      <Field label="Reden" style={portalStyles.full}>
        <Input value={reason} onChange={setReason} placeholder="Vakantie" />
      </Field>
      <Field label="Van">
        <Input type="date" value={from} onChange={setFrom} />
      </Field>
      <Field label="Tot en met">
        <Input type="date" value={to} onChange={setTo} />
      </Field>
      <Field label="Welke lessen" style={portalStyles.full}>
        <Select
          value={scope}
          onChange={setScope}
          options={[['', 'Alle lessen'], ...schedule.data.sessions.filter((x) => !isExtra(x)).map((x): [string, string] => [x.id, weekLabel(x)])]}
        />
      </Field>
      {preview ? (
        <View style={portalStyles.full}>
          <Preview
            text={`${preview.lessons} ${preview.lessons === 1 ? 'les vervalt' : 'lessen vervallen'}${
              preview.scheduled ? `; ${preview.scheduled} keer stond er een klant ingepland. Er gaat daarvoor geen strip af.` : '.'
            }`}
          />
        </View>
      ) : null}
      {error ? (
        <View style={portalStyles.full}>
          <ErrorText text={error} />
        </View>
      ) : null}
      <View style={[portalStyles.full, { flexDirection: 'row' }]}>
        <Btn label="Vakantie opslaan" tone="primary" onPress={save} />
      </View>
    </View>
  );
}

function LessonForm({ extra }: { extra: boolean }) {
  const schedule = useSchedule();
  const portal = usePortal();
  const { today } = schedule;
  const [day, setDay] = useState('Maandag');
  const [from, setFrom] = useState(today);
  const [until, setUntil] = useState('');
  const [date, setDate] = useState(today);
  const [start, setStart] = useState('19:00');
  const [end, setEnd] = useState('20:00');
  const [style, setStyle] = useState<ClassStyle>('yin');
  const [capacity, setCapacity] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const problem =
      !start || !end
        ? 'Vul een begin- en eindtijd in.'
        : end <= start
          ? 'De eindtijd moet na de begintijd liggen.'
          : extra
            ? !date ? 'Kies een datum.' : date < today ? 'Die datum is al voorbij.' : ''
            : !from ? 'Kies vanaf wanneer de les start.' : until && until < from ? 'De einddatum ligt vóór de startdatum.' : '';
    if (problem) return setError(problem);
    const time = `${start.replace(':', '.')} – ${end.replace(':', '.')}`;
    schedule.addSession(
      extra
        ? { day: weekdayOf(date), style, time, capacity, from: date, until: date }
        : { day, style, time, capacity, from, until: until || null }
    );
    setError(null);
    portal.toast(extra ? 'Extra les toegevoegd ✓' : 'Groepsles toegevoegd ✓');
  };

  return (
    <View style={portalStyles.form}>
      {extra ? (
        <Field label="Datum" style={portalStyles.full}>
          <Input type="date" min={today} value={date} onChange={setDate} />
        </Field>
      ) : (
        <>
          <Field label="Dag" style={portalStyles.full}>
            <Select value={day} onChange={setDay} options={DAYS.map((d): [string, string] => [d, d])} />
          </Field>
          <Field label="Eerste les vanaf">
            <Input type="date" value={from} onChange={setFrom} />
          </Field>
          <Field label="Tot en met (optioneel)">
            <Input type="date" value={until} onChange={setUntil} />
          </Field>
        </>
      )}
      <Field label="Begintijd">
        <Input type="time" value={start} onChange={setStart} />
      </Field>
      <Field label="Eindtijd">
        <Input type="time" value={end} onChange={setEnd} />
      </Field>
      <Field label="Soort les" style={portalStyles.full}>
        <View style={s.row}>
          {(Object.keys(styleMeta) as ClassStyle[]).map((k) => (
            <Chip key={k} label={styleMeta[k].label} active={style === k} onPress={() => setStyle(k)} />
          ))}
        </View>
      </Field>
      <View style={portalStyles.full}>
        <KV label="Aantal plekken">
          <Stepper value={capacity} onChange={(d) => setCapacity((c) => Math.max(1, c + d))} />
        </KV>
      </View>
      {error ? (
        <View style={portalStyles.full}>
          <ErrorText text={error} />
        </View>
      ) : null}
      <View style={[portalStyles.full, { flexDirection: 'row' }]}>
        <Btn label={extra ? 'Extra les opslaan' : 'Groepsles opslaan'} tone="primary" onPress={save} />
      </View>
    </View>
  );
}
