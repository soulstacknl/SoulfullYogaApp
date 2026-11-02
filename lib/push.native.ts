// Push notifications are sent by the database (lesson reminders, chat, news,
// cancellations and requests); the app registers this device and opens what a
// tapped notification is about.
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
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
      await Notifications.setNotificationChannelAsync('berichten', {
        name: 'Chat en nieuws',
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

// Tapping a notification opens what it is about (data.url, e.g. /chat or /nieuws/<id>).
export function useNotificationLinks() {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const url = response?.notification.request.content.data?.url;
    if (typeof url === 'string') router.push(url as never);
  }, [response]);
}
