import {
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
  useFonts as useFrauncesFonts,
} from '@expo-google-fonts/fraunces';
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
  useFonts as useWorkSansFonts,
} from '@expo-google-fonts/work-sans';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { InboxProvider } from '@/contexts/InboxContext';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import { UsersProvider } from '@/contexts/UsersContext';
import { useNotificationLinks } from '@/lib/push';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.ivory,
    card: colors.ink,
    text: colors.ink,
    primary: colors.rani,
    border: colors.sand,
  },
};

export default function RootLayout() {
  const [frauncesLoaded, frauncesError] = useFrauncesFonts({
    Fraunces_600SemiBold,
    Fraunces_500Medium_Italic,
  });
  const [workSansLoaded, workSansError] = useWorkSansFonts({
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  const loaded = frauncesLoaded && workSansLoaded;
  const error = frauncesError || workSansError;

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <DataProvider>
        <UsersProvider>
          <ScheduleProvider>
            <InboxProvider>
              <ThemeProvider value={theme}>
                <NotificationLinks />
                <Stack screenOptions={{ contentStyle: { backgroundColor: colors.ivory } }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="admin" options={{ headerShown: false }} />
                  <Stack.Screen name="voorwaarden" options={{ headerShown: false }} />
                  <Stack.Screen name="account-aanvragen" options={{ headerShown: false }} />
                  <Stack.Screen name="wachtwoord-vergeten" options={{ headerShown: false }} />
                  <Stack.Screen name="wachtwoord-instellen" options={{ headerShown: false }} />
                  <Stack.Screen name="chat" options={{ headerShown: false }} />
                  <Stack.Screen name="nieuws" options={{ headerShown: false }} />
                  <Stack.Screen name="portal" options={{ headerShown: false, title: 'Beheerportaal' }} />
                </Stack>
              </ThemeProvider>
            </InboxProvider>
          </ScheduleProvider>
        </UsersProvider>
      </DataProvider>
    </AuthProvider>
  );
}

// Opens the screen a tapped push notification points to.
function NotificationLinks() {
  useNotificationLinks();
  return null;
}
