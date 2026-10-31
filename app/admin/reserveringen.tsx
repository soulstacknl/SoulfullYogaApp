import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import RequestActionSheet from '@/components/RequestActionSheet';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { ReservationRequest } from '@/contexts/ScheduleContext';
import { dateLabel } from '@/lib/dutchDate';

export default function ReserveringenScreen() {
  const { data, sessionById, resolveRequest } = useSchedule();
  const { requests } = data;
  const [selected, setSelected] = useState<ReservationRequest | null>(null);

  const closeSheet = () => setSelected(null);

  const handleResolve = (approved: boolean) => {
    if (!selected) return;
    resolveRequest(selected.id, approved);
    closeSheet();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Reserveringen"
        subtitle="Tik op een aanvraag om te beoordelen"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {requests.length === 0 ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
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
});
