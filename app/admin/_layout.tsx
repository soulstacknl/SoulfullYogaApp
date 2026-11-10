import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

// Admin screens have no tab bar: keep the content above the phone's navigation bar,
// so lists scroll all the way to their last item.
export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory, paddingBottom: insets.bottom } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="roster" />
      <Stack.Screen name="klanten" />
      <Stack.Screen name="rooster-beheer" />
      <Stack.Screen name="les-form" />
      <Stack.Screen name="priveles" />
      <Stack.Screen name="vervallen" />
      <Stack.Screen name="les-bewerken" />
      <Stack.Screen name="voorwaarden" />
      <Stack.Screen name="reserveringen" />
      <Stack.Screen name="betaalverzoeken" />
      <Stack.Screen name="plekken" />
      <Stack.Screen name="nieuws-schrijven" />
      <Stack.Screen name="nieuw-gesprek" />
    </Stack>
  );
}
