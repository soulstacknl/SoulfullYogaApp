import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { weekLabel, weeklySessions } from '@/components/portal/KlantDrawer';
import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Empty, Input, Meta, Meter, PageHeader, Pill, s, Select, StyleDot } from '@/components/portal/ui';
import Stepper from '@/components/Stepper';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { CARD_SIZE, useUsers } from '@/contexts/UsersContext';
import type { MockUser } from '@/data/users';
import { dateLabel, plusDays } from '@/lib/dutchDate';
import { activeOn, openChargeCount, startTimeOf } from '@/lib/schedule';

type Filters = { les: string; strippen: string; voorwaarden: string; open: string };
const NO_FILTERS: Filters = { les: '', strippen: '', voorwaarden: '', open: '' };

const FILTER_OPTIONS: Record<'strippen' | 'voorwaarden' | 'open', [string, string][]> = {
  strippen: [['', 'Alle strippen'], ['op', 'Op (0)'], ['bijna', 'Bijna op (1–2)'], ['genoeg', '3 of meer'], ['geen', 'Geen kaart']],
  voorwaarden: [['', 'Voorwaarden: alle'], ['ja', 'Akkoord'], ['nee', 'Nog niet akkoord']],
  open: [['', 'Openstaand: alle'], ['ja', 'Met openstaande lessen'], ['nee', 'Zonder openstaande lessen']],
};

// All customers with filters per column (combined) plus a name/e-mail search.
export default function PortalKlanten() {
  const schedule = useSchedule();
  const { students, adjustStrip, activateCard } = useUsers();
  const portal = usePortal();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [search, setSearch] = useState('');

  const { data, today } = schedule;
  const standingIds = (email: string) => schedule.activeEnrollmentsOf(email).map((e) => e.sessionId);
  const weekly = weeklySessions(data.sessions, today);

  const matches = (u: MockUser) => {
    const ids = standingIds(u.email);
    const st = u.strippen;
    const open = openChargeCount(data, u.email);
    if (filters.les === 'geen' ? ids.length : filters.les && !ids.includes(filters.les)) return false;
    if (filters.strippen === 'op' && st !== 0) return false;
    if (filters.strippen === 'bijna' && !(st !== null && st >= 1 && st <= 2)) return false;
    if (filters.strippen === 'genoeg' && !(st !== null && st >= 3)) return false;
    if (filters.strippen === 'geen' && st !== null) return false;
    if (filters.voorwaarden === 'ja' && !u.termsAcceptedAt) return false;
    if (filters.voorwaarden === 'nee' && u.termsAcceptedAt) return false;
    if (filters.open === 'ja' && !open) return false;
    if (filters.open === 'nee' && open) return false;
    const q = search.trim().toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.includes(q);
  };
  const list = students.filter(matches).sort((a, b) => a.name.localeCompare(b.name));
  const active = Object.values(filters).some(Boolean) || search.trim() !== '';
  const setFilter = (key: keyof Filters) => (value: string) => setFilters((f) => ({ ...f, [key]: value }));

  const askCard = (u: MockUser) =>
    portal.confirm({
      title: 'Nieuwe strippenkaart?',
      message: `${u.name} krijgt een nieuwe 10-strippenkaart: ${u.strippen ?? 0} → ${(u.strippen ?? 0) + CARD_SIZE} strippen.`,
      confirmLabel: 'Activeren',
      onConfirm: () => activateCard(u.email),
    });

  // Summary of the next lesson when filtering on one standing lesson.
  let lesInfo = null;
  const filtered = filters.les && filters.les !== 'geen' ? schedule.sessionById(filters.les) : undefined;
  if (filtered) {
    let date = today;
    for (let i = 0; i < 14 && (!activeOn(filtered, date) || schedule.hasStarted(filtered, date)); i++) date = plusDays(date, 1);
    const closure = schedule.closureOf(filtered.id, date);
    const regulars = students.filter((u) => standingIds(u.email).includes(filtered.id));
    const off = regulars.filter((u) => schedule.statusFor(u.email, filtered.id, date)?.cancelled).length;
    lesInfo = (
      <Card style={styles.lesInfo}>
        <StyleDot style={filtered.style} />
        <Meta
          title={`${filtered.day} ${filtered.time} · ${styleMeta[filtered.style].label}`}
          detail={`${regulars.length} vaste klanten · ${filtered.capacity} plekken · volgende les ${dateLabel(date)}${
            closure ? ` vervalt (${closure.reason})` : off ? ` · ${off} afgemeld` : ''
          }`}
        />
        {closure ? (
          <Pill label="Vervalt" tone="muted" />
        ) : (
          <View style={{ width: 190, flexDirection: 'row' }}>
            <Meter occupancy={schedule.occupancy(filtered.id, date)} />
          </View>
        )}
        <Btn label="Open les" small onPress={() => portal.openLesson(filtered.id, date)} />
      </Card>
    );
  }

  return (
    <View>
      <PageHeader
        title="Klanten"
        subtitle={`${active ? `${list.length} van ${students.length}` : students.length} klanten met de app · klik op een klant voor de lessen`}
      />
      <View style={[s.row, { marginBottom: 14 }]}>
        <Input type="search" value={search} onChange={setSearch} placeholder="Zoek op naam of e-mail…" style={{ width: 220 }} />
        <Select
          value={filters.les}
          onChange={setFilter('les')}
          highlight={!!filters.les}
          options={[['', 'Alle vaste lessen'], ...weekly.map((x): [string, string] => [x.id, weekLabel(x)]), ['geen', 'Geen vaste les']]}
        />
        <Select value={filters.strippen} onChange={setFilter('strippen')} highlight={!!filters.strippen} options={FILTER_OPTIONS.strippen} />
        <Select value={filters.voorwaarden} onChange={setFilter('voorwaarden')} highlight={!!filters.voorwaarden} options={FILTER_OPTIONS.voorwaarden} />
        <Select value={filters.open} onChange={setFilter('open')} highlight={!!filters.open} options={FILTER_OPTIONS.open} />
        {active ? (
          <Btn
            label="Wis filters"
            small
            onPress={() => {
              setFilters(NO_FILTERS);
              setSearch('');
            }}
          />
        ) : null}
      </View>
      {lesInfo}
      <Card>
        {list.length ? (
          <>
            <View style={styles.head}>
              {['Klant', 'Telefoon', 'Strippen', 'Vaste les', 'Voorwaarden', 'Openstaand'].map((h, i) => (
                <Text key={h} style={[styles.th, COLS[i]]}>
                  {h}
                </Text>
              ))}
            </View>
            {list.map((u) => {
              const ids = standingIds(u.email);
              const open = openChargeCount(data, u.email);
              return (
                <Pressable
                  key={u.email}
                  onPress={() => portal.openKlant(u.email)}
                  style={({ hovered }: { hovered?: boolean }) => [styles.tr, hovered && { backgroundColor: '#FBF7EF' }]}>
                  <View style={COLS[0]}>
                    <Text style={s.nm}>{u.name}</Text>
                    <Text style={s.dt}>{u.email}</Text>
                  </View>
                  <Text style={[s.body, COLS[1]]}>{u.phone}</Text>
                  <View style={[s.row, COLS[2]]}>
                    <Stepper value={u.strippen ?? 0} onChange={(d) => adjustStrip(u.email, d)} />
                    <Btn label="+10" tone="teal" small onPress={() => askCard(u)} />
                    {u.strippen === null ? <Pill label="geen kaart" tone="muted" /> : null}
                  </View>
                  <Text style={[s.body, COLS[3], !ids.length && { color: colors.mutedText }]}>
                    {ids.length
                      ? ids
                          .map((id) => schedule.sessionById(id)!)
                          .map((x) => `${x.day} ${startTimeOf(x)}`)
                          .join(', ')
                      : '—'}
                  </Text>
                  <View style={COLS[4]}>
                    {u.termsAcceptedAt ? <Pill label={`✓ ${u.termsAcceptedAt}`} tone="teal" /> : <Pill label="Nog niet" tone="rani" />}
                  </View>
                  <View style={COLS[5]}>
                    {open ? <Pill label={`${open} ${open === 1 ? 'les' : 'lessen'}`} tone="rani" /> : <Text style={s.small}>—</Text>}
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : (
          <Empty text="Geen klanten met deze filters." />
        )}
      </Card>
    </View>
  );
}

const COLS = [
  { flex: 2.2, minWidth: 0 },
  { flex: 1.2, minWidth: 0 },
  { width: 280 },
  { flex: 1.3, minWidth: 0 },
  { flex: 1.1, minWidth: 0, alignItems: 'flex-start' as const },
  { flex: 1, minWidth: 0, alignItems: 'flex-start' as const },
];

const styles = StyleSheet.create({
  lesInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14, paddingVertical: 14, paddingHorizontal: 18 },
  head: { flexDirection: 'row', gap: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.sand },
  th: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.mutedText },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1EADC' },
});
