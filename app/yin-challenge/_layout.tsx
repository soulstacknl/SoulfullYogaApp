import { Stack } from 'expo-router';

import LoginPrompt from '@/components/LoginPrompt';
import { useCurrentUser } from '@/contexts/UsersContext';

// The challenge is for customers only, like the rest of Inspiratie.
export default function YinChallengeLayout() {
  const user = useCurrentUser();
  if (!user) {
    return <LoginPrompt title="Yin challenge" subtitle="30 dagen Yin yoga" text="Log in om de Yin challenge te bekijken." />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
