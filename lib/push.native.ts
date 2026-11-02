// Push notifications: the reminder 24 hours before a lesson is sent by the
// database (send_lesson_reminders); the app only registers this device for it.
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let registeredToken: string | null = null;

// Asks permission (once) and links this device to the signed-in user.
export async function registerPush() {
  try {
    if (Platform.OS === 'android') {
      // Android 13+ only shows the permission prompt once a channel exists.
      await Notifications.setNotificationChannelAsync('lessen', {
        name: 'Herinneringen voor je lessen',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const { error } = await supabase.rpc('register_push_token', { p_token: token, p_platform: Platform.OS });
    if (!error) registeredToken = token;
  } catch {
    // No push in Expo Go, on simulators or offline; the app works fine without it.
  }
}

// Before logging out, so the next user of this phone doesn't get these reminders.
export async function unregisterPush() {
  if (!registeredToken) return;
  await supabase.rpc('unregister_push_token', { p_token: registeredToken });
  registeredToken = null;
}
