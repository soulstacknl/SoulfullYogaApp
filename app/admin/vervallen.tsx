import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateField } from '@/components/DateTimeField';
import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { plusDays } from '@/lib/dutchDate';
import { isExtra, startTimeOf } from '@/lib/schedule';

// Cancel lessons for a period (holiday) — all lessons, or one weekly session.
export default function VervallenScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { data, today, addClosure, closurePreview } = useSchedule();

  const [reason, setReason] = useState('Vakantie');
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(plusDays(today, 6));
  const [scope, setScope] = useState<string | null>(sessionId ?? null);
  const [error, setError] = useState<string | null>(null);

  const weekly = data.sessions.filter((s) => !isExtra(s));
  const preview = closurePreview(from, to, scope);

  const save = () => {
    if (to < from) return setError('De einddatum ligt vóór de begindatum.');
    addClosure({ from, to, sessionId: scope, reason: reason.trim() || 'Vakantie' });
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Rooster beheren"
        title="Lessen laten vervallen"
        subtitle="Bijvoorbeeld voor een vakantie"
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Reden" value={reason} onChangeText={setReason} placeholder="Vakantie" autoCapitalize="sentences" />
        <DateField label="Van" value={from} onChange={(v) => v && setFrom(v)} />
        <DateField label="Tot en met" value={to} onChange={(v) => v && setTo(v)} />

        <Text style={styles.label}>Welke lessen</Text>
        <View style={styles.options}>
          <Option label="Alle lessen" active={scope === null} onPress={() => setScope(null)} />
          {weekly.map((s) => (
            <Option
              key={s.id}
              label={`${s.day} ${startTimeOf(s)} · ${styleMeta[s.style].label}`}
              active={scope === s.id}
              onPress={() => setScope(s.id)}
            />
          ))}
        </View>

        {preview ? (
          <Text style={styles.preview}>
            {preview.lessons} {preview.lessons === 1 ? 'les vervalt' : 'lessen vervallen'}
            {preview.scheduled
              ? `; ${preview.scheduled} keer stond er een klant ingepland. Er gaat daarvoor geen strip af.`
              : '.'}
          </Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Opslaan</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Option({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.option, active && styles.optionActive]} onPress={onPress}>
      <View style={[styles.radio, active && styles.radioActive]} />
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: 20,
    paddingTop: 18,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
    marginBottom: 6,
  },
  options: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory,
  },
  optionActive: {
    backgroundColor: '#F7F1E6',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.sand,
  },
  radioActive: {
    borderColor: colors.rani,
    borderWidth: 6,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.ink,
  },
  preview: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B4A0C',
    backgroundColor: '#FCF1DE',
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: colors.rani,
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
});
