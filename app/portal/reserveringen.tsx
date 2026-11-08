import { View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Empty, Meta, Meter, PageHeader, Pill, Row, s, StyleDot } from '@/components/portal/ui';
import { styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { dateLabel } from '@/lib/dutchDate';

// Requests for single lessons (a request already holds the spot), and the customers'
// cancellations: Akkoord only marks one as seen, the customer is already cancelled.
export default function PortalReserveringen() {
  const schedule = useSchedule();
  const portal = usePortal();
  const { users } = useUsers();
  const requests = schedule.data.requests;
  const cancellations = schedule.openCancellations();
  const nameOf = (email: string) => users.find((u) => u.email === email)?.name ?? email;

  return (
    <View>
      <PageHeader title="Reserveringen" subtitle="Aanvragen voor losse lessen en afmeldingen van klanten." />
      <Card title="Aanvragen" note="een aanvraag houdt de plek al vast">
        {requests.length ? (
          requests.map((r) => {
            const session = schedule.sessionById(r.sessionId);
            if (!session) return null;
            return (
              <Row key={r.id}>
                <StyleDot style={session.style} />
                <Meta title={r.name} detail={r.email} />
                <Meta title={dateLabel(r.date)} detail={`${styleMeta[session.style].label} · ${session.time}`} />
                <View style={{ width: 180, flexDirection: 'row' }}>
                  <Meter occupancy={schedule.occupancy(r.sessionId, r.date)} />
                </View>
                <View style={s.row}>
                  <Btn
                    label="✓ Goedkeuren"
                    tone="teal"
                    small
                    onPress={() => {
                      schedule.resolveRequest(r.id, true);
                      portal.toast('Goedgekeurd ✓');
                    }}
                  />
                  <Btn
                    label="✕ Weigeren"
                    tone="ghost"
                    small
                    onPress={() => {
                      schedule.resolveRequest(r.id, false);
                      portal.toast('Geweigerd');
                    }}
                  />
                </View>
              </Row>
            );
          })
        ) : (
          <Empty text="Geen open aanvragen. Nieuwe aanvragen uit de app verschijnen hier direct." />
        )}
      </Card>
      <Card title="Afmeldingen" note="de klant is al afgemeld · Akkoord betekent: gezien">
        {cancellations.length ? (
          cancellations.map((c) => {
            const session = c.kind === 'groep' ? schedule.sessionById(c.sessionId) : undefined;
            if (c.kind === 'groep' && !session) return null;
            return (
              <Row key={c.key}>
                {session ? <StyleDot style={session.style} /> : null}
                <Meta title={nameOf(c.email)} detail={c.at ? `afgemeld ${new Date(c.at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : c.email} />
                <Meta
                  title={dateLabel(c.date)}
                  detail={session ? `${styleMeta[session.style].label} · ${session.time}` : `Privéles · ${c.kind === 'prive' ? c.time : ''}`}
                />
                <Pill
                  label={c.kind === 'groep' && c.charged ? 'Binnen 24 uur · −1 strip' : c.kind === 'prive' ? 'Privéles' : 'Kosteloos'}
                  tone={c.kind === 'groep' && c.charged ? 'rani' : 'muted'}
                />
                <Btn
                  label="✓ Akkoord"
                  tone="teal"
                  small
                  onPress={() => {
                    schedule.acknowledgeCancellation(c);
                    portal.toast('Gezien ✓');
                  }}
                />
              </Row>
            );
          })
        ) : (
          <Empty text="Geen nieuwe afmeldingen." />
        )}
      </Card>
    </View>
  );
}
