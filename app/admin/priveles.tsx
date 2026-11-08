import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateField, TimeField } from '@/components/DateTimeField';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUsers } from '@/contexts/UsersContext';
import type { AppUser } from '@/data/users';
import { dateLabel, toDate } from '@/lib/dutchDate';

const minutes = (t: string) => {
  const [h, m] = t.split('.').map(Number);
  return h * 60 + m;
};
const clock = (total: number) =>
  `${String(Math.floor(total / 60) % 24).padStart(2, '0')}.${String(total % 60).padStart(2, '0')}`;

// Plan a private lesson: first the customer, then the date and time. The customer
// gets a push and sees it in Mijn lessen; it uses no strips.
export default function PrivelesScreen() {
  const { today, addPrivateLesson } = useSchedule();
  const { students } = useUsers();
  const [customer, setCustomer] = useState<AppUser | null>(null);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(today);
  const [start, setStart] = useState('10.00');
  const [end, setEnd] = useState('11.00');
  const [error, setError] = useState<string | null>(null);

  const query = search.trim().toLowerCase();
  const found = students.filter((u) => !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));

  // Moving the start keeps the length of the lesson.
  const changeStart = (value: string) => {
    setEnd(clock(minutes(value) + minutes(end) - minutes(start)));
    setStart(value);
  };

  const save = () => {
    if (!customer) return;
    if (minutes(end) <= minutes(start)) return setError('De eindtijd moet na de begintijd liggen.');
    if (toDate(date, start) <= new Date()) return setError('Dat tijdstip is al voorbij.');
    addPrivateLesson(customer.email, date, `${start} – ${end}`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => (customer ? setCustomer(null) : router.back())}
        eyebrow="Rooster beheren"
        title="Privéles"
        subtitle={customer ? `Met ${customer.name}` : 'Kies eerst de klant'}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!customer ? (
          <>
            <TextInput
              style={styles.search}
              value={search}
              onChangeText={setSearch}
              placeholder="Zoek op naam of e-mail"
              placeholderTextColor={colors.mutedText}
              autoCorrect={false}
            />
            {found.map((u) => (
              <Pressable
                key={u.email}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => setCustomer(u)}>
                <View style={styles.info}>
                  <Text style={styles.name}>{u.name}</Text>
                  <Text style={styles.detail}>{u.email}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
            {found.length === 0 ? <Text style={styles.note}>Geen klant gevonden.</Text> : null}
          </>
        ) : (
          <>
            <View style={styles.chosen}>
              <View style={styles.info}>
                <Text style={styles.name}>{customer.name}</Text>
                <Text style={styles.detail}>{customer.email}</Text>
              </View>
              <Pressable onPress={() => setCustomer(null)} hitSlop={8}>
                <Text style={styles.change}>Wijzig</Text>
              </Pressable>
            </View>
            <DateField label="Datum" value={date} onChange={(v) => v && v >= today && setDate(v)} />
            <View style={styles.timeRow}>
              <TimeField label="Begintijd" value={start} onChange={changeStart} />
              <TimeField label="Eindtijd" value={end} onChange={setEnd} />
            </View>
            <Text style={styles.note}>
              {customer.name.split(' ')[0]} krijgt een pushmelding en ziet de privéles op {dateLabel(date).toLowerCase()} in Mijn
              lessen. Er gaan geen strippen af; afmelden kan tot de les begint.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveBtnText}>Privéles inplannen</Text>
            </Pressable>
          </>
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
    paddingTop: 18,
  },
  search: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 14,
    marginBottom: 8,
  },
  rowPressed: {
    transform: [{ scale: 0.98 }],
  },
  chosen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
    padding: 14,
    marginBottom: 16,
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
  chevron: {
    fontSize: 22,
    color: colors.sand,
  },
  change: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.rani,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.mutedText,
    marginBottom: 16,
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
