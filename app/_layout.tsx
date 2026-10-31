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
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import { UsersProvider } from '@/contexts/UsersContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
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
      <UsersProvider>
        <ScheduleProvider>
          <ThemeProvider value={theme}>
            <Stack screenOptions={{ contentStyle: { backgroundColor: colors.ivory } }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="voorwaarden" options={{ headerShown: false }} />
              <Stack.Screen name="portal" options={{ headerShown: false, title: 'Beheerportaal' }} />
            </Stack>
          </ThemeProvider>
        </ScheduleProvider>
      </UsersProvider>
    </AuthProvider>
  );
}
