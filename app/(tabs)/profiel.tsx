import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import LoginScreen from '@/components/LoginScreen';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useCurrentUser, useUsers } from '@/contexts/UsersContext';

const prices = [
  { label: 'Gratis proefles', price: '€0' },
  { label: 'Losse les', price: '€15' },
  { label: '10-strippenkaart', price: '€110' },
];

export default function ProfielScreen() {
  const { login, logout } = useAuth();
  const user = useCurrentUser();
  const { students } = useUsers();
  const { data, unconfirmedLessons } = useSchedule();
  const { requests } = data;
  const toConfirm = user?.role === 'admin' ? unconfirmedLessons().length : 0;

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  const isAdmin = user.role === 'admin';
  const hasStrippenkaart = user.strippen !== null;

  return (
    <View style={styles.container}>
      <ScreenHeader eyebrow="Jouw account" title="Profiel" subtitle="Berghem · info@soulfulyoga.nl" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <LinearGradient
            colors={[colors.marigold, colors.rani]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {isAdmin ? <Text style={styles.adminBadge}>Beheerder</Text> : null}
        </View>

        {isAdmin ? (
          <>
            <View style={styles.stripCard}>
              <Text style={styles.stripLabel}>Beheerdersaccount</Text>
              <Text style={styles.stripCountEmpty}>Beheer je studio</Text>
              <Text style={styles.stripSub}>gebruik de knoppen hieronder om rooster en strippenkaarten bij te werken</Text>
            </View>

            <View style={styles.adminActions}>
              <Pressable style={styles.adminActionBtn} onPress={() => router.push('/admin')}>
                <Text style={styles.adminActionIcon}>✅</Text>
                <Text style={styles.adminActionText}>Vandaag · presentielijst</Text>
                {toConfirm > 0 ? (
                  <View style={styles.adminActionBadge}>
                    <Text style={styles.adminActionBadgeText}>{toConfirm}</Text>
                  </View>
                ) : null}
                <Text style={styles.adminActionChevron}>›</Text>
              </Pressable>
              <Pressable style={styles.adminActionBtn} onPress={() => router.push('/admin/rooster-beheer')}>
                <Text style={styles.adminActionIcon}>🗓️</Text>
                <Text style={styles.adminActionText}>Rooster beheren</Text>
                <Text style={styles.adminActionChevron}>›</Text>
              </Pressable>
              <Pressable style={styles.adminActionBtn} onPress={() => router.push('/admin/strippen')}>
                <Text style={styles.adminActionIcon}>🎟️</Text>
                <Text style={styles.adminActionText}>Strippenkaart beheren</Text>
                <Text style={styles.adminActionChevron}>›</Text>
              </Pressable>
              <Pressable style={styles.adminActionBtn} onPress={() => router.push('/admin/reserveringen')}>
                <Text style={styles.adminActionIcon}>📨</Text>
                <Text style={styles.adminActionText}>Reservering aanvragen</Text>
                {requests.length > 0 ? (
                  <View style={styles.adminActionBadge}>
                    <Text style={styles.adminActionBadgeText}>{requests.length}</Text>
                  </View>
                ) : null}
                <Text style={styles.adminActionChevron}>›</Text>
              </Pressable>
              <Pressable style={styles.adminActionBtn} onPress={() => router.push('/admin/voorwaarden')}>
                <Text style={styles.adminActionIcon}>📄</Text>
                <View style={styles.adminActionTextWrap}>
                  <Text style={styles.adminActionText}>Algemene voorwaarden</Text>
                  <Text style={styles.adminActionSub}>
                    {students.filter((s) => s.termsAcceptedAt).length} van {students.length} klanten akkoord
                  </Text>
                </View>
                <Text style={styles.adminActionChevron}>›</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.stripCard}>
              <Text style={styles.stripLabel}>Strippenkaart</Text>
              {hasStrippenkaart ? (
                <>
                  <Text style={styles.stripCount}>
                    {user.strippen} / {user.total}
                  </Text>
                  <Text style={styles.stripSub}>nog {user.strippen} lessen tegoed</Text>
                </>
              ) : (
                <>
                  <Text style={styles.stripCountEmpty}>Nog geen kaart</Text>
                  <Text style={styles.stripSub}>koop een strippenkaart hieronder om te starten</Text>
                </>
              )}
            </View>

            <Text style={styles.sectionLabel}>Tarieven</Text>
            <View style={styles.priceList}>
              {prices.map((row) => (
                <View key={row.label} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{row.label}</Text>
                  <Text style={styles.priceValue}>{row.price}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.termsRow} onPress={() => router.push('/voorwaarden')}>
              <Text style={styles.termsIcon}>📄</Text>
              <View style={styles.adminActionTextWrap}>
                <Text style={styles.termsTitle}>Algemene voorwaarden</Text>
                {user.termsAcceptedAt ? (
                  <Text style={[styles.termsStatus, styles.termsStatusOk]}>✓ Akkoord op {user.termsAcceptedAt}</Text>
                ) : (
                  <Text style={[styles.termsStatus, styles.termsStatusTodo]}>Nog niet akkoord</Text>
                )}
              </View>
              <Text style={styles.adminActionChevron}>›</Text>
            </Pressable>
          </>
        )}

        <View style={styles.contactBlock}>
          <Text style={styles.contactStudio}>Soulful Yoga</Text>
          <Text style={styles.contactLine}>Runselstraat 18, 5351 NJ Berghem</Text>
          <Text style={styles.contactLine}>06 12 68 08 52 · info@soulfulyoga.nl</Text>
        </View>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Uitloggen</Text>
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
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    marginBottom: 10,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 2,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mutedText,
  },
  adminBadge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.rani,
    marginTop: 6,
  },
  stripCard: {
    marginHorizontal: 20,
    marginVertical: 18,
    backgroundColor: colors.ink,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  stripLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.marigold,
  },
  stripCount: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ivory,
    marginVertical: 4,
  },
  stripCountEmpty: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ivory,
    marginVertical: 6,
  },
  stripSub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: '#CABFDB',
  },
  sectionLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  priceList: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  priceLabel: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.ink,
  },
  priceValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.rani,
  },
  contactBlock: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  contactStudio: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.ink,
    marginBottom: 4,
  },
  contactLine: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.mutedText,
    lineHeight: 20,
  },
  logoutBtn: {
    alignItems: 'center',
    marginTop: 22,
  },
  logoutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.mutedText,
    textDecorationLine: 'underline',
  },
  adminActions: {
    marginHorizontal: 20,
    marginBottom: 18,
    gap: 10,
  },
  adminActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  adminActionIcon: {
    fontSize: 20,
  },
  adminActionTextWrap: {
    flex: 1,
  },
  adminActionSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  termsIcon: {
    fontSize: 18,
  },
  termsTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  termsStatus: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    marginTop: 1,
  },
  termsStatusOk: {
    color: colors.teal,
  },
  termsStatusTodo: {
    color: colors.rani,
  },
  adminActionText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  adminActionChevron: {
    fontSize: 20,
    color: colors.sand,
  },
  adminActionBadge: {
    backgroundColor: colors.rani,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminActionBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: '#fff',
  },
});
