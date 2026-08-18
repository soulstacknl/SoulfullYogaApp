import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';

export default function ReserveringenScreen() {
  const { requests } = useSchedule();

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Reserveringen"
        subtitle="Aanvragen van klanten"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {requests.length === 0 ? (
          <Text style={styles.empty}>Nog geen aanvragen</Text>
        ) : (
          requests.map((request) => {
            const meta = styleMeta[request.style];
            return (
              <View key={request.id} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: meta.color }]}>
                  <Text style={styles.dotLabel}>{meta.dotLabel}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{request.studentName}</Text>
                  <Text style={styles.detail}>
                    {meta.label} · {request.day} · {request.time}
                  </Text>
                  <Text style={styles.email}>{request.studentEmail}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
    color: '#A89BB5',
    marginTop: 2,
  },
});
