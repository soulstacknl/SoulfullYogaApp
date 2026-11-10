import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import RequestActionSheet from '@/components/RequestActionSheet';
import ScreenHeader from '@/components/ScreenHeader';
import Tag from '@/components/Tag';
import Toast, { useToast } from '@/components/Toast';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { ReservationRequest } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import { dateLabel } from '@/lib/dutchDate';
import type { OpenCancellation } from '@/lib/schedule';

type Tab = 'aanvragen' | 'afmeldingen';

// "zo 8 nov 16.43"
const momentLabel = (iso: string) =>
  iso
    ? new Date(iso)
        .toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        .replace(':', '.')
    : '';

// Requests for single lessons, and the customers' cancellations. Akkoord on a
// cancellation only marks it as seen: the customer is already cancelled.
export default function ReserveringenScreen() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const { data, sessionById, resolveRequest, openCancellations, acknowledgeCancellation } = useSchedule();
  const { users } = useUsers();
  const { requests } = data;
  const cancellations = openCancellations();
  const [tab, setTab] = useState<Tab>(params.tab === 'afmeldingen' ? 'afmeldingen' : 'aanvragen');
  const [selected, setSelected] = useState<ReservationRequest | null>(null);
  const toast = useToast();

  const nameOf = (email: string) => users.find((u) => u.email === email)?.name ?? email;
  const closeSheet = () => setSelected(null);

  const handleResolve = (approved: boolean) => {
    if (!selected) return;
    resolveRequest(selected.id, approved);
    closeSheet();
  };

  const renderCancellation = (c: OpenCancellation) => {
    const session = c.kind === 'groep' ? sessionById(c.sessionId) : undefined;
    if (c.kind === 'groep' && !session) return null;
    const meta = session ? styleMeta[session.style] : undefined;
    return (
      <View key={c.key} style={styles.row}>
        <View style={[styles.dot, { backgroundColor: meta?.color ?? colors.plum }]}>
          <Text style={styles.dotLabel}>{meta?.dotLabel ?? 'P'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{nameOf(c.email)}</Text>
          <Text style={styles.detail}>
            {meta?.label ?? 'Privéles'} · {dateLabel(c.date)} · {session?.time ?? (c.kind === 'prive' ? c.time : '')}
          </Text>
          {c.kind === 'groep' && c.charged ? (
            <Tag label="Binnen 24 uur · −1 strip" tone="rani" />
          ) : (
            <Tag label={c.kind === 'prive' ? 'Privéles afgemeld' : 'Kosteloos afgemeld'} tone="muted" />
          )}
          {c.at ? <Text style={styles.email}>Afgemeld {momentLabel(c.at)}</Text> : null}
        </View>
        <Pressable
          style={styles.okBtn}
          hitSlop={6}
          onPress={() => {
            acknowledgeCancellation(c);
            toast.show('Gezien ✓');
          }}>
          <Text style={styles.okBtnText}>Akkoord</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Reserveringen"
        subtitle={tab === 'aanvragen' ? 'Tik op een aanvraag om te beoordelen' : 'De klant is al afgemeld; Akkoord betekent: gezien'}
      />
      <View style={styles.segment}>
        {(['aanvragen', 'afmeldingen'] as const).map((t) => {
          const count = t === 'aanvragen' ? requests.length : cancellations.length;
          return (
            <Pressable key={t} style={[styles.segmentBtn, tab === t && styles.segmentBtnOn]} onPress={() => setTab(t)}>
              <Text style={[styles.segmentText, tab === t && styles.segmentTextOn]}>
                {t === 'aanvragen' ? 'Aanvragen' : 'Afmeldingen'}
                {count ? ` (${count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'afmeldingen' ? (
          cancellations.length === 0 ? (
            <Text style={styles.empty}>Geen nieuwe afmeldingen</Text>
          ) : (
            cancellations.map(renderCancellation)
          )
        ) : requests.length === 0 ? (
          <Text style={styles.empty}>Nog geen aanvragen</Text>
        ) : (
          requests.map((request) => {
            const session = sessionById(request.sessionId);
            if (!session) return null;
            const meta = styleMeta[session.style];
            return (
              <Pressable
                key={request.id}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => setSelected(request)}>
                <View style={[styles.dot, { backgroundColor: meta.color }]}>
                  <Text style={styles.dotLabel}>{meta.dotLabel}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{request.name}</Text>
                  <Text style={styles.detail}>
                    {meta.label} · {dateLabel(request.date)} · {session.time}
                  </Text>
                  <Text style={styles.email}>{request.email}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <RequestActionSheet
        request={selected}
        onClose={closeSheet}
        onApprove={() => handleResolve(true)}
        onReject={() => handleResolve(false)}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#EFE6D6',
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 20,
    marginTop: 14,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentBtnOn: {
    backgroundColor: colors.card,
  },
  segmentText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.mutedText,
  },
  segmentTextOn: {
    color: colors.ink,
  },
  content: {
    padding: 20,
    paddingTop: 14,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 14,
    marginBottom: 10,
  },
  rowPressed: {
    transform: [{ scale: 0.98 }],
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  detail: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.mutedText,
    marginTop: 1,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: '#9DAFA2',
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: colors.sand,
  },
  okBtn: {
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  okBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.teal,
  },
});
