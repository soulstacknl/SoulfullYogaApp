import { View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Empty, Meta, Meter, PageHeader, Pill, Row, s, StyleDot } from '@/components/portal/ui';
import { styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { dateLabel, plusMonths } from '@/lib/dutchDate';

const moment = (iso: string) => new Date(iso).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Customers plan lessons themselves when there is a spot: Aanmeldingen is for information
// (Akkoord = seen). A customer's cancellation keeps the spot taken until Akkoord; then the
// spot is free and the waiting list gets a push. Below: the last 3 months.
export default function PortalReserveringen() {
  const schedule = useSchedule();
  const portal = usePortal();
  const { users } = useUsers();
  const requests = schedule.data.requests;
  const bookings = schedule.openBookings();
  const cancellations = schedule.openCancellations();
  const nameOf = (email: string) => users.find((u) => u.email === email)?.name ?? email;
  const lessonDetail = (sessionId: string) => {
    const session = schedule.sessionById(sessionId);
    return session ? `${styleMeta[session.style].label} · ${session.time}` : '';
  };

  // The last 3 months, newest first: lessons customers planned (themselves, or an approved
  // request from before) and the customers' own cancellations.
  const since = plusMonths(schedule.today, -3);
  const signedUp = schedule.data.bookings
    .map((b) => ({ ...b, when: b.approvedAt ?? (b.by === 'klant' ? b.at : undefined) }))
    .filter((b) => b.when && b.when.slice(0, 10) >= since)
    .sort((a, b) => b.when!.localeCompare(a.when!));
  const cancelHistory = [
    ...schedule.data.cancels
      .filter((c) => c.by === 'klant' && c.at && c.at.slice(0, 10) >= since)
      .map((c) => ({
        key: `g:${c.sessionId}@${c.date}:${c.email}`, email: c.email, at: c.at!, date: c.date,
        session: schedule.sessionById(c.sessionId), time: '', charged: !!c.charged, open: !c.seen,
      })),
    ...schedule.data.privates
      .filter((p) => p.cancelled && p.cancelledAt && p.cancelledAt.slice(0, 10) >= since)
      .map((p) => ({ key: `p:${p.id}`, email: p.email, at: p.cancelledAt!, date: p.date, session: undefined, time: p.time, charged: false, open: !p.cancelSeen })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <View>
      <PageHeader title="Reserveringen" subtitle="Aanmeldingen en afmeldingen van klanten." />
      <Card title="Aanmeldingen" note="klanten plannen zelf in als er plek is · Akkoord betekent: gezien">
        {bookings.length ? (
          bookings.map((b) => {
            const session = schedule.sessionById(b.sessionId);
            if (!session) return null;
            return (
              <Row key={`${b.sessionId}@${b.date}#${b.email}`}>
                <StyleDot style={session.style} />
                <Meta title={nameOf(b.email)} detail={b.at ? `aangemeld ${moment(b.at)}` : b.email} />
                <Meta title={dateLabel(b.date)} detail={lessonDetail(b.sessionId)} />
                <View style={{ width: 180, flexDirection: 'row' }}>
                  <Meter occupancy={schedule.occupancy(b.sessionId, b.date)} />
                </View>
                <Btn
                  label="✓ Akkoord"
                  tone="teal"
                  small
                  onPress={() => {
                    schedule.acknowledgeBooking(b);
                    portal.toast('Gezien ✓');
                  }}
                />
              </Row>
            );
          })
        ) : (
          <Empty text="Geen nieuwe aanmeldingen. Klanten die zichzelf inplannen verschijnen hier direct." />
        )}
        {/* Requests from before customers could plan themselves. */}
        {requests.map((r) => {
          const session = schedule.sessionById(r.sessionId);
          if (!session) return null;
          return (
            <Row key={r.id}>
              <StyleDot style={session.style} />
              <Meta title={r.name} detail="aanvraag" />
              <Meta title={dateLabel(r.date)} detail={lessonDetail(r.sessionId)} />
              <View style={s.row}>
                <Btn label="✓ Goedkeuren" tone="teal" small onPress={() => { schedule.resolveRequest(r.id, true); portal.toast('Goedgekeurd ✓'); }} />
                <Btn label="✕ Weigeren" tone="ghost" small onPress={() => { schedule.resolveRequest(r.id, false); portal.toast('Geweigerd'); }} />
              </View>
            </Row>
          );
        })}
      </Card>
      <Card title="Afmeldingen" note="de plek komt pas vrij na Akkoord · daarna krijgt de wachtlijst een melding">
        {cancellations.length ? (
          cancellations.map((c) => {
            const session = c.kind === 'groep' ? schedule.sessionById(c.sessionId) : undefined;
            if (c.kind === 'groep' && !session) return null;
            return (
              <Row key={c.key}>
                {session ? <StyleDot style={session.style} /> : null}
                <Meta title={nameOf(c.email)} detail={c.at ? `afgemeld ${moment(c.at)}` : c.email} />
                <Meta
                  title={dateLabel(c.date)}
                  detail={session ? `${styleMeta[session.style].label} · ${session.time}` : `Privéles · ${c.kind === 'prive' ? c.time : ''}`}
                />
                <Pill
                  label={c.kind === 'groep' && c.charged ? 'Binnen 24 uur · −1 strip' : c.kind === 'prive' ? 'Privéles' : 'Kosteloos'}
                  tone={c.kind === 'groep' && c.charged ? 'rani' : 'muted'}
                />
                {c.kind === 'groep' && schedule.waitlistOf(c.sessionId, c.date).length ? (
                  <Pill label={`${schedule.waitlistOf(c.sessionId, c.date).length} op wachtlijst`} tone="pending" />
                ) : null}
                <Btn
                  label="✓ Akkoord"
                  tone="teal"
                  small
                  onPress={() => {
                    schedule.acknowledgeCancellation(c);
                    portal.toast(c.kind === 'groep' ? 'Bevestigd ✓ · de plek is weer vrij' : 'Gezien ✓');
                  }}
                />
              </Row>
            );
          })
        ) : (
          <Empty text="Geen nieuwe afmeldingen." />
        )}
      </Card>
      <Card title="Aanmeldingen" note={`afgelopen 3 maanden · ${signedUp.length}`}>
        {signedUp.length ? (
          signedUp.map((b) => {
            const session = schedule.sessionById(b.sessionId);
            return (
              <Row key={`${b.sessionId}@${b.date}:${b.email}`}>
                {session ? <StyleDot style={session.style} /> : null}
                <Meta title={nameOf(b.email)} detail={`${b.approvedAt ? 'goedgekeurd' : 'aangemeld'} ${moment(b.when!)}`} />
                <Meta title={dateLabel(b.date)} detail={lessonDetail(b.sessionId)} />
                <Pill label={b.approvedAt ? '✓ Aanvraag goedgekeurd' : '✓ Zelf ingepland'} tone="teal" />
              </Row>
            );
          })
        ) : (
          <Empty text="Nog geen aanmeldingen in de afgelopen 3 maanden." />
        )}
      </Card>
      <Card title="Afmeldingen" note={`afgelopen 3 maanden · ${cancelHistory.length}`}>
        {cancelHistory.length ? (
          cancelHistory.map((c) => (
            <Row key={c.key}>
              {c.session ? <StyleDot style={c.session.style} /> : null}
              <Meta title={nameOf(c.email)} detail={`afgemeld ${moment(c.at)}`} />
              <Meta title={dateLabel(c.date)} detail={c.session ? `${styleMeta[c.session.style].label} · ${c.session.time}` : `Privéles · ${c.time}`} />
              <Pill label={c.charged ? 'Binnen 24 uur · −1 strip' : c.session ? 'Kosteloos' : 'Privéles'} tone={c.charged ? 'rani' : 'muted'} />
              {c.open ? <Pill label="Nog bevestigen" tone="pending" /> : null}
            </Row>
          ))
        ) : (
          <Empty text="Geen afmeldingen in de afgelopen 3 maanden." />
        )}
      </Card>
    </View>
  );
}
