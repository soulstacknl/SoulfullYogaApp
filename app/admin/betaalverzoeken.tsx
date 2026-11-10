import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Toast, { useToast } from '@/components/Toast';
import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';
import { useUsers } from '@/contexts/UsersContext';
import type { Message } from '@/lib/inbox';
import { euro } from '@/lib/inbox';

type Tab = 'open' | 'betaald';

const sentOn = (iso: string) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

// Every payment request sent in the chats: what is still open, and what was paid.
export default function BetaalverzoekenScreen() {
  const inbox = useInbox();
  const { users } = useUsers();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('open');
  const { open, paid } = inbox.payments;
  const list = tab === 'open' ? open : paid;
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? 'Verwijderde klant';
  const openTotal = open.reduce((sum, m) => sum + (m.amountCents ?? 0), 0);

  const row = (m: Message) => (
    <View key={m.id} style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{nameOf(m.customerId)}</Text>
        <Text style={styles.amount}>{euro(m.amountCents ?? 0)}</Text>
        <Text style={styles.detail}>{m.body}</Text>
        <Text style={styles.meta}>
          Verstuurd {sentOn(m.at)}
          {m.paidAt ? ` · betaald ${sentOn(m.paidAt)}` : ''}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, m.paidAt ? styles.btnGhost : styles.btnTeal]}
          onPress={async () => {
            if (await inbox.setPaid(m.id, !m.paidAt)) toast.show(m.paidAt ? 'Weer op open gezet' : 'Betaald ✓');
          }}>
          <Text style={[styles.btnText, m.paidAt && styles.btnGhostText]}>{m.paidAt ? 'Toch open' : '✓ Betaald'}</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnGhost]}
          onPress={() => router.push({ pathname: '/chat', params: { klant: m.customerId } })}>
          <Text style={[styles.btnText, styles.btnGhostText]}>💬 Chat</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Betaalverzoeken"
        subtitle={open.length ? `${open.length} open · samen ${euro(openTotal)}` : 'Alles is betaald'}
      />
      <View style={styles.segment}>
        {(['open', 'betaald'] as const).map((t) => (
          <Pressable key={t} style={[styles.segmentBtn, tab === t && styles.segmentBtnOn]} onPress={() => setTab(t)}>
            <Text style={[styles.segmentText, tab === t && styles.segmentTextOn]}>
              {t === 'open' ? `Open (${open.length})` : `Betaald (${paid.length})`}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {list.length ? (
          list.map(row)
        ) : (
          <Text style={styles.empty}>
            {tab === 'open' ? 'Geen openstaande betaalverzoeken.' : 'Nog geen betaalde verzoeken.'}
          </Text>
        )}
        <Text style={styles.note}>Een betaalverzoek stuur je in de chat met een klant: tik daar op ＋ → Betaalverzoek.</Text>
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  segment: { flexDirection: 'row', backgroundColor: '#EFE6D6', borderRadius: 12, padding: 3, marginHorizontal: 20, marginTop: 14 },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
  segmentBtnOn: { backgroundColor: colors.card },
  segmentText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mutedText },
  segmentTextOn: { color: colors.ink },
  content: { padding: 20, paddingTop: 14, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 14,
    marginBottom: 10,
  },
  info: { flex: 1 },
  name: { fontFamily: fonts.bodySemiBold, fontSize: 14.5, color: colors.ink },
  amount: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginTop: 2 },
  detail: { fontFamily: fonts.body, fontSize: 13, color: colors.descText },
  meta: { fontFamily: fonts.body, fontSize: 11.5, color: colors.mutedText, marginTop: 4 },
  actions: { gap: 8, justifyContent: 'center' },
  btn: { borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1.5 },
  btnTeal: { backgroundColor: colors.teal, borderColor: colors.teal },
  btnGhost: { backgroundColor: '#fff', borderColor: colors.sand },
  btnText: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: '#fff' },
  btnGhostText: { color: colors.ink },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, textAlign: 'center', marginTop: 30 },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedText, textAlign: 'center', marginTop: 18 },
});
