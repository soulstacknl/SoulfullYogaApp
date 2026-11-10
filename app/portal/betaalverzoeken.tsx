import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Empty, Meta, PageHeader, Pill, Row, s } from '@/components/portal/ui';
import { useInbox } from '@/contexts/InboxContext';
import { useUsers } from '@/contexts/UsersContext';
import type { Message } from '@/lib/inbox';
import { euro } from '@/lib/inbox';

const day = (iso: string) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

// Payment requests from all chats: open ones first, then the ones paid.
export default function PortalBetaalverzoeken() {
  const inbox = useInbox();
  const portal = usePortal();
  const router = useRouter();
  const { users } = useUsers();
  const { open, paid } = inbox.payments;
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? 'Verwijderde klant';
  const total = open.reduce((sum, m) => sum + (m.amountCents ?? 0), 0);

  const row = (m: Message) => (
    <Row key={m.id}>
      <Meta title={nameOf(m.customerId)} detail={`${m.body} · verstuurd ${day(m.at)}`} />
      <Meta title={euro(m.amountCents ?? 0)} detail={m.paidAt ? `betaald ${day(m.paidAt)}` : 'nog niet betaald'} />
      {m.paidAt ? <Pill label="✓ Betaald" tone="teal" /> : <Pill label="Open" tone="pending" />}
      <View style={s.row}>
        <Btn
          label={m.paidAt ? 'Toch open' : '✓ Betaald'}
          tone={m.paidAt ? 'ghost' : 'teal'}
          small
          onPress={async () => {
            if (await inbox.setPaid(m.id, !m.paidAt)) portal.toast(m.paidAt ? 'Weer op open gezet' : 'Betaald ✓');
          }}
        />
        <Btn label="💬 Chat" small onPress={() => router.push({ pathname: '/portal/berichten', params: { klant: m.customerId } })} />
      </View>
    </Row>
  );

  return (
    <View>
      <PageHeader
        title="Betaalverzoeken"
        subtitle={open.length ? `${open.length} open, samen ${euro(total)}. Een betaalverzoek stuur je via Berichten.` : 'Alles is betaald. Een betaalverzoek stuur je via Berichten.'}
      />
      <Card title="Open" note={open.length ? euro(total) : undefined}>
        {open.length ? open.map(row) : <Empty text="Geen openstaande betaalverzoeken." />}
      </Card>
      <Card title="Betaald">{paid.length ? paid.map(row) : <Empty text="Nog geen betaalde verzoeken." />}</Card>
    </View>
  );
}
