import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateField, TimeField } from '@/components/DateTimeField';
import ScreenHeader from '@/components/ScreenHeader';
import Stepper from '@/components/Stepper';
import { colors, fonts, styleMeta } from '@/constants/theme';
import type { ClassStyle } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { plusDays, WEEKDAYS, weekdayOf } from '@/lib/dutchDate';

const DAYS = [...WEEKDAYS.slice(1), WEEKDAYS[0]]; // Monday first

// Add a weekly lesson ("vast") or a one-off extra lesson on a single date.
export default function LesFormScreen() {
  const { kind } = useLocalSearchParams<{ kind: 'vast' | 'extra' }>();
  const extra = kind === 'extra';
  const { today, addSession } = useSchedule();

  const [day, setDay] = useState('Maandag');
  const [from, setFrom] = useState(today);
  const [until, setUntil] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [start, setStart] = useState('19.00');
  const [end, setEnd] = useState('20.00');
  const [style, setStyle] = useState<ClassStyle>('yin');
  const [capacity, setCapacity] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (end <= start) return setError('De eindtijd moet na de begintijd liggen.');
    if (!extra && until && until < from) return setError('De einddatum ligt vóór de startdatum.');
    const time = `${start} – ${end}`;
    addSession(
      extra
        ? { day: weekdayOf(date), style, time, capacity, from: date, until: date }
        : { day, style, time, capacity, from, until }
    );
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Rooster beheren"
        title={extra ? 'Extra les' : 'Vaste les toevoegen'}
        subtitle={extra ? 'Eenmalig, op één datum' : 'Komt elke week terug'}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {extra ? (
          <DateField label="Datum" value={date} onChange={(v) => v && v >= today && setDate(v)} />
        ) : (
          <>
            <Text style={styles.label}>Dag</Text>
            <View style={styles.chips}>
              {DAYS.map((d) => (
                <Chip key={d} label={d.slice(0, 2)} active={day === d} onPress={() => setDay(d)} />
              ))}
            </View>
            <DateField label="Eerste les vanaf" value={from} onChange={(v) => v && setFrom(v)} />
            <DateField
              label="Tot en met"
              value={until}
              onChange={setUntil}
              optional={{ emptyLabel: 'Doorlopend', fallback: plusDays(from, 84) }}
            />
          </>
        )}

        <View style={styles.timeRow}>
          <TimeField label="Begintijd" value={start} onChange={setStart} />
          <TimeField label="Eindtijd" value={end} onChange={setEnd} />
        </View>

        <Text style={styles.label}>Soort les</Text>
        <View style={styles.chips}>
          {(Object.keys(styleMeta) as ClassStyle[]).map((s) => (
            <Chip key={s} label={styleMeta[s].label} active={style === s} onPress={() => setStyle(s)} />
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Aantal plekken</Text>
          <Stepper value={capacity} onChange={(d) => setCapacity((c) => Math.max(1, c + d))} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Opslaan</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.ivory,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  panelLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
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
