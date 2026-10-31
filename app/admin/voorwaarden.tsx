import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Tag from '@/components/Tag';
import { colors, fonts } from '@/constants/theme';
import { useUsers } from '@/contexts/UsersContext';
import { TERMS_VERSION } from '@/data/terms';

const initialsFor = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Who agreed to the algemene voorwaarden — customers without agreement first.
export default function VoorwaardenOverzichtScreen() {
  const { students } = useUsers();
  const sorted = [...students].sort(
    (a, b) => Number(!!a.termsAcceptedAt) - Number(!!b.termsAcceptedAt) || a.name.localeCompare(b.name)
  );
  const accepted = students.filter((s) => s.termsAcceptedAt).length;

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Algemene voorwaarden"
        subtitle={`${accepted} van ${students.length} klanten akkoord`}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sorted.map((user) => (
          <View key={user.email} style={styles.row}>
            <View style={styles.initials}>
              <Text style={styles.initialsText}>{initialsFor(user.name)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
            {user.termsAcceptedAt ? (
              <Tag label={`✓ ${user.termsAcceptedAt}`} tone="teal" style={styles.status} />
            ) : (
              <Tag label="Nog niet" tone="rani" style={styles.status} />
            )}
          </View>
        ))}
        <Pressable style={styles.linkBtn} onPress={() => router.push('/voorwaarden')}>
          <Text style={styles.linkText}>Bekijk de tekst ({TERMS_VERSION.toLowerCase()})</Text>
        </Pressable>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 12,
    marginBottom: 9,
  },
  initials: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: '#A89BB5',
    marginTop: 1,
  },
  status: {
    marginTop: 0,
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  linkBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  linkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.mutedText,
    textDecorationLine: 'underline',
  },
});
