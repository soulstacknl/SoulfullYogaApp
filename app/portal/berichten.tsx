import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import ChatThread from '@/components/ChatThread';
import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Empty, Input, Note, PageHeader } from '@/components/portal/ui';
import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { msgTime } from '@/lib/inbox';
import { currentStandingSession, startTimeOf } from '@/lib/schedule';

const initials = (name: string) =>
  name.split(' ').filter((w) => /^\p{L}/u.test(w)).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// 1-op-1 chat with customers: conversations on the left, the open one on the right.
export default function PortalBerichten() {
  const inbox = useInbox();
  const { users, students } = useUsers();
  const schedule = useSchedule();
  const portal = usePortal();
  const { height, width } = useWindowDimensions();
  const { klant } = useLocalSearchParams<{ klant?: string }>();
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const matches = (id: string) => {
    const u = users.find((x) => x.id === id);
    return !q || !!u && (u.name.toLowerCase().includes(q) || u.email.includes(q));
  };
  const shown = inbox.conversations.filter((c) => matches(c.customerId));
  // Searching a customer without a conversation yet starts a new one.
  const fresh = q ? students.filter((u) => !inbox.conversations.some((c) => c.customerId === u.id) && matches(u.id)).slice(0, 8) : [];
  const selectedId = klant && users.some((u) => u.id === klant) ? klant : shown[0]?.customerId;
  const selected = users.find((u) => u.id === selectedId);
  const open = (id: string) => router.setParams({ klant: id });
  const standing = selected ? currentStandingSession(schedule.data, selected.email, schedule.today) : null;

  return (
    <View>
      <PageHeader title="Berichten" subtitle="Chat 1-op-1 met klanten. Ze krijgen een pushmelding bij elk bericht." />
      <View style={[styles.grid, width < 1000 && { flexDirection: 'column' }]}>
        <Card style={styles.list}>
          <Input type="search" value={search} onChange={setSearch} placeholder="Zoek of start een gesprek…" style={{ marginBottom: 8 }} />
          {shown.map((c) => {
            const u = users.find((x) => x.id === c.customerId);
            return (
              <Conv
                key={c.customerId}
                name={u?.name ?? 'Klant'}
                last={`${c.last.fromStudio ? 'Jij: ' : ''}${c.last.body}`}
                time={msgTime(c.last.at)}
                unread={c.unread}
                active={c.customerId === selectedId}
                onPress={() => open(c.customerId)}
              />
            );
          })}
          {fresh.length ? <Note text="Nieuw gesprek met" style={{ marginTop: 10, marginBottom: 4 }} /> : null}
          {fresh.map((u) => (
            <Conv key={u.id} name={u.name} last={u.email} unread={0} active={u.id === selectedId} onPress={() => open(u.id)} />
          ))}
          {!shown.length && !fresh.length ? <Empty text={q ? 'Geen klant gevonden.' : 'Nog geen gesprekken. Zoek een klant om te beginnen.'} /> : null}
        </Card>
        {selected ? (
          <Card style={[styles.pane, { height: Math.max(420, height - 170) }]}>
            <View style={styles.paneHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.paneName}>{selected.name}</Text>
                <Text style={styles.paneSub}>
                  {selected.email} · {standing ? `groepsles ${standing.day.toLowerCase()} ${startTimeOf(standing)}` : 'geen groepsles'} ·{' '}
                  {selected.strippen === null ? 'geen kaart' : `${selected.strippen} strippen`}
                </Text>
              </View>
              <Btn label="Klantkaart ›" small onPress={() => portal.openKlant(selected.email, true)} />
            </View>
            <ChatThread key={selected.id} customerId={selected.id} emptyText={`Nog geen berichten. Stuur ${selected.name.split(' ')[0]} een bericht.`} />
          </Card>
        ) : (
          <Card style={{ flex: 1 }}>
            <Empty text="Kies links een gesprek, of zoek een klant om een nieuw gesprek te starten." />
          </Card>
        )}
      </View>
    </View>
  );
}

function Conv({ name, last, time, unread, active, onPress }: { name: string; last: string; time?: string; unread: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: { hovered?: boolean }) => [styles.conv, active ? { backgroundColor: '#E9EEDF' } : hovered && { backgroundColor: '#FBF7EF' }]}>
      <View style={styles.ini}>
        <Text style={styles.iniText}>{initials(name)}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
          <Text style={styles.convName} numberOfLines={1}>
            {name}
          </Text>
          {time ? <Text style={styles.convTime}>{time}</Text> : null}
        </View>
        <Text style={[styles.convLast, unread > 0 && { color: colors.ink, fontFamily: fonts.bodySemiBold }]} numberOfLines={1}>
          {last}
        </Text>
      </View>
      {unread ? <Text style={styles.count}>{unread}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  list: { width: 340, maxWidth: '100%', paddingVertical: 12, paddingHorizontal: 12 },
  pane: { flex: 1, minWidth: 0, padding: 0, paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' },
  paneHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.sand },
  paneName: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
  paneSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText, marginTop: 1 },
  conv: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12 },
  ini: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  iniText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },
  convName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink, flexShrink: 1 },
  convTime: { fontFamily: fonts.body, fontSize: 11.5, color: colors.mutedText },
  convLast: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText, marginTop: 1 },
  count: { backgroundColor: colors.rani, color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11, borderRadius: 10, minWidth: 20, paddingVertical: 2, paddingHorizontal: 6, textAlign: 'center', overflow: 'hidden' },
});
