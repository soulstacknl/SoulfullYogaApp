import { router, Slot, usePathname } from 'expo-router';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import KlantDrawer from '@/components/portal/KlantDrawer';
import LessonDrawer from '@/components/portal/LessonDrawer';
import { PortalContext } from '@/components/portal/PortalContext';
import type { PortalDrawer } from '@/components/portal/PortalContext';
import { Btn, ErrorText, Field, Input } from '@/components/portal/ui';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useData } from '@/contexts/DataContext';
import { useCurrentUser } from '@/contexts/UsersContext';

const NAV = [
  { path: '/portal', icon: '🗓️', label: 'Rooster' },
  { path: '/portal/reserveringen', icon: '📨', label: 'Reserveringen' },
  { path: '/portal/klanten', icon: '👥', label: 'Klanten' },
  { path: '/portal/beheer', icon: '🛠️', label: 'Rooster beheren' },
  { path: '/portal/presentie', icon: '✅', label: 'Presentielijst' },
] as const;

// Admin portal for a laptop browser: shares the schedule and users with the app.
export default function PortalLayout() {
  const user = useCurrentUser();
  const { userId } = useAuth();
  const { loading } = useData();
  const { logout } = useAuth();
  const schedule = useSchedule();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [drawer, setDrawer] = useState<PortalDrawer>(null);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.login, { padding: 32 }]}>
        <Text style={styles.loginTitle}>Het beheerportaal werkt in de browser op een laptop.</Text>
      </View>
    );
  }
  if (userId && (loading || !user)) {
    return (
      <View style={styles.login}>
        <Text style={[styles.loginSub, { color: colors.ivory }]}>Laden…</Text>
      </View>
    );
  }
  if (user?.role !== 'admin') return <PortalLogin signedInAs={user?.name ?? null} />;

  const toast = (message: string) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2400);
  };
  const badge = (path: string) =>
    path === '/portal/reserveringen' ? schedule.data.requests.length : path === '/portal/presentie' ? schedule.unconfirmedLessons().length : 0;
  const narrow = width < 800;

  return (
    <PortalContext.Provider
      value={{
        toast,
        confirm: setConfirmRequest,
        openLesson: (sessionId, date) => setDrawer({ type: 'les', sessionId, date }),
        openKlant: (email, onKlanten) => {
          if (onKlanten) router.navigate('/portal/klanten');
          setDrawer({ type: 'klant', email });
        },
        closeDrawer: () => setDrawer(null),
        toPresentie: (sessionId, date) => {
          setDrawer(null);
          router.navigate({ pathname: '/portal/presentie', params: { sessionId, date } });
        },
      }}>
      <View style={[styles.shell, narrow && { flexDirection: 'column' }]}>
        <View style={[styles.side, narrow && styles.sideNarrow]}>
          <View style={styles.brand}>
            <Image source={require('@/assets/images/logo-mark.png')} style={{ width: 46, height: 34 }} resizeMode="contain" />
            <View>
              <Text style={styles.brandName}>Soulful Yoga</Text>
              <Text style={styles.brandSub}>Beheerportaal</Text>
            </View>
          </View>
          <View style={[styles.nav, narrow && { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {NAV.map((item) => {
              const on = pathname === item.path;
              const count = badge(item.path);
              return (
                <Pressable
                  key={item.path}
                  onPress={() => {
                    setDrawer(null);
                    router.navigate(item.path);
                  }}
                  style={({ hovered }: { hovered?: boolean }) => [styles.navItem, on ? styles.navOn : hovered && styles.navHover]}>
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={[styles.navText, on && { color: '#fff', fontFamily: fonts.bodySemiBold }]}>{item.label}</Text>
                  {count ? <Text style={styles.badge}>{count}</Text> : null}
                </Pressable>
              );
            })}
          </View>
          {/* On a narrow screen only the links, below the menu. */}
          <View style={[styles.sideFoot, narrow && styles.sideFootNarrow]}>
            {!narrow ? (
              <>
                <Text style={styles.footName}>{user.name}</Text>
                <Text style={styles.footText}>{user.email}</Text>
              </>
            ) : null}
            <View style={[styles.footRow, narrow && { marginTop: 0 }]}>
              <Pressable onPress={() => router.navigate('/')}>
                <Text style={styles.footLink}>Naar de app</Text>
              </Pressable>
              <Pressable onPress={logout}>
                <Text style={styles.footLink}>Uitloggen</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.main, narrow && { padding: 16 }]}>
          <Slot />
        </ScrollView>
      </View>

      {drawer?.type === 'les' ? <LessonDrawer key={`${drawer.sessionId}@${drawer.date}`} sessionId={drawer.sessionId} date={drawer.date} /> : null}
      {drawer?.type === 'klant' ? <KlantDrawer key={drawer.email} email={drawer.email} /> : null}
      {/* Mounted only while open, so it stacks above an open side panel. */}
      {confirmRequest ? <ConfirmDialog request={confirmRequest} onClose={() => setConfirmRequest(null)} /> : null}
      {/* Straight on <body>, so it also shows above an open side panel. */}
      {toastMessage
        ? createPortal(
            <View pointerEvents="none" style={styles.toast}>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>,
            document.body
          )
        : null}
    </PortalContext.Provider>
  );
}

// `signedInAs`: a customer is signed in (e.g. in the app in this browser) — no access.
function PortalLogin({ signedInAs }: { signedInAs: string | null }) {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Vul je e-mailadres en wachtwoord in.');
    setError(await login(email.trim().toLowerCase(), password));
  };

  if (signedInAs) {
    return (
      <View style={styles.login}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Geen toegang</Text>
          <Text style={styles.loginSub}>Je bent ingelogd als {signedInAs}. Alleen beheerders hebben toegang tot het portaal.</Text>
          <Btn label="Uitloggen" tone="primary" onPress={logout} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.login}>
      <View style={styles.loginCard}>
        <Image source={require('@/assets/images/logo-mark.png')} style={styles.loginLogo} resizeMode="contain" />
        <Text style={styles.loginTitle}>Beheerportaal</Text>
        <Text style={styles.loginSub}>Soulful Yoga · log in als beheerder</Text>
        <View style={{ gap: 12 }}>
          <Field label="E-mailadres">
            <Input type="email" value={email} onChange={setEmail} placeholder="beheer@soulfulyoga.nl" onEnter={submit} />
          </Field>
          <Field label="Wachtwoord">
            <Input type="password" value={password} onChange={setPassword} placeholder="••••••••" onEnter={submit} />
          </Field>
          <ErrorText text={error} />
          <Btn label="Inloggen" tone="primary" onPress={submit} />
        </View>
        <Text style={styles.hint}>Demo: beheer@soulfulyoga.nl · admin123</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: colors.ivory, minHeight: '100%' },
  side: { width: 240, backgroundColor: colors.ink },
  sideNarrow: { width: '100%' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 22, paddingBottom: 18, paddingHorizontal: 20 },
  brandName: { fontFamily: fonts.display, fontSize: 18, color: colors.ivory },
  brandSub: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.marigold },
  nav: { gap: 2, paddingVertical: 8, paddingHorizontal: 10, flex: 1 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  navOn: { backgroundColor: 'rgba(255,255,255,0.12)' },
  navHover: { backgroundColor: 'rgba(255,255,255,0.06)' },
  navIcon: { width: 20, textAlign: 'center' },
  navText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: '#CFE0D4', flex: 1 },
  badge: { backgroundColor: colors.rani, color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11, borderRadius: 10, minWidth: 20, paddingVertical: 2, paddingHorizontal: 6, textAlign: 'center', overflow: 'hidden' },
  sideFoot: { paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  sideFootNarrow: { paddingTop: 10, paddingBottom: 12 },
  footName: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: '#fff' },
  footText: { fontFamily: fonts.body, fontSize: 12.5, color: '#BACDC0' },
  footRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  footLink: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.marigold },
  main: { paddingTop: 28, paddingHorizontal: 36, paddingBottom: 60 },
  toast: { position: 'fixed' as 'absolute', bottom: 24, right: 24, backgroundColor: colors.teal, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, zIndex: 99999 },
  toastText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: '#fff' },
  login: { flex: 1, minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.ink },
  loginCard: { backgroundColor: colors.ivory, borderRadius: 22, padding: 32, width: 400, maxWidth: '100%' },
  loginLogo: { width: 90, height: 66, backgroundColor: colors.ink, borderRadius: 14, marginBottom: 6 },
  loginTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginTop: 10 },
  loginSub: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, marginBottom: 20 },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedText, textAlign: 'center', marginTop: 16 },
});
