import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="roster" />
      <Stack.Screen name="strippen" />
      <Stack.Screen name="rooster-info" />
    </Stack>
  );
}
