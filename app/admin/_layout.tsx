import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="roster" />
      <Stack.Screen name="klanten" />
      <Stack.Screen name="rooster-beheer" />
      <Stack.Screen name="les-form" />
      <Stack.Screen name="vervallen" />
      <Stack.Screen name="les-bewerken" />
      <Stack.Screen name="voorwaarden" />
      <Stack.Screen name="reserveringen" />
      <Stack.Screen name="plekken" />
      <Stack.Screen name="nieuws-schrijven" />
      <Stack.Screen name="nieuw-gesprek" />
    </Stack>
  );
}
