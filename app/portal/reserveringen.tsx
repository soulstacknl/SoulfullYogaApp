import { View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Empty, Meta, Meter, PageHeader, Row, s, StyleDot } from '@/components/portal/ui';
import { styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { dateLabel } from '@/lib/dutchDate';

// Requests for single lessons; a request already holds the spot.
export default function PortalReserveringen() {
  const schedule = useSchedule();
  const portal = usePortal();
  const requests = schedule.data.requests;

  return (
    <View>
      <PageHeader title="Reserveringen" subtitle="Aanvragen voor losse lessen. Een aanvraag houdt de plek al vast." />
      <Card>
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
    </View>
  );
}
