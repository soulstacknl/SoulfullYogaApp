import { router } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useCurrentUser, useUsers } from '@/contexts/UsersContext';
import { terms, TERMS_VERSION } from '@/data/terms';

const todayDDMMYYYY = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

// The algemene voorwaarden. Customers agree with the switch at the bottom;
// it doesn't block anything, the admin just sees who agreed.
export default function VoorwaardenScreen() {
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const { setTermsAccepted } = useUsers();
  const accepted = !!user?.termsAcceptedAt;

  return (
    <View style={styles.container}>
      <ScreenHeader backLabel="Terug" onBack={() => router.back()} eyebrow="Soulful Yoga" title="Algemene voorwaarden" subtitle="" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.version}>{TERMS_VERSION}</Text>
        {terms.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.paragraphs?.map((p) => (
              <Text key={p} style={styles.body}>
                {p}
              </Text>
            ))}
            {section.bullets?.map((b) => (
              <Text key={b} style={styles.body}>
                • {b}
              </Text>
            ))}
            {section.closing?.map((p) => (
              <Text key={p} style={styles.body}>
                {p}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>

      {user?.role === 'student' ? (
        <View style={[styles.acceptBar, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.acceptText}>
            <Text style={styles.acceptLabel}>Ik ga akkoord met de algemene voorwaarden</Text>
            <Text style={styles.acceptSub}>
              {accepted ? `Akkoord gegeven op ${user.termsAcceptedAt}` : 'Zet het schuifje aan om akkoord te gaan'}
            </Text>
          </View>
          <Switch
            value={accepted}
            onValueChange={(on) => setTermsAccepted(user.email, on ? todayDDMMYYYY() : null)}
            trackColor={{ false: colors.sand, true: colors.teal }}
            thumbColor="#fff"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
  },
  version: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mutedText,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: fonts.displayItalic,
    fontSize: 15,
    color: colors.rani,
    marginTop: 18,
    marginBottom: 6,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.descText,
  },
  acceptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.ivory,
    borderTopWidth: 1,
    borderTopColor: colors.sand,
    paddingTop: 14,
    paddingHorizontal: 22,
  },
  acceptText: {
    flex: 1,
  },
  acceptLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.ink,
  },
  acceptSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
});
