// Push notifications are sent by the database (lesson reminders, chat, news,
// cancellations and requests); the app registers this device and opens what a
// tapped notification is about. Every notification carries data.uid: the account
// it is meant for. A phone that switched accounts never shows another account's
// notifications.
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

const currentUserId = async () => (await supabase.auth.getSession()).data.session?.user.id ?? null;
// Meant for whoever is logged in now? Older notifications without uid are shown.
const isForMe = async (notification: Notifications.Notification) => {
  const uid = notification.request.content.data?.uid;
  return typeof uid !== 'string' || uid === (await currentUserId());
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const show = await isForMe(notification);
    return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: false, shouldSetBadge: false };
  },
});

const projectId = () => Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

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

    const token = (await Notifications.getExpoPushTokenAsync({ projectId: projectId() })).data;
    await supabase.rpc('register_push_token', { p_token: token, p_platform: Platform.OS });
  } catch {
    // No push in Expo Go, on simulators or offline; the app works fine without it.
  }
}

// Before logging out: this phone stops getting the account's notifications. The token is
// looked up again, so this also works when registering at startup didn't finish.
export async function unregisterPush() {
  try {
    if ((await Notifications.getPermissionsAsync()).status !== 'granted') return;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: projectId() })).data;
    await supabase.rpc('unregister_push_token', { p_token: token });
    // Notifications already in the tray belong to the account that is logging out.
    await Notifications.dismissAllNotificationsAsync();
  } catch {
    // Offline: the next login on this phone takes the device over anyway.
  }
}

// Tapping a notification opens what it is about (data.url, e.g. /chat or /nieuws/<id>),
// only when it is meant for the account that is logged in. The last response is kept by
// the system across app starts, so it is cleared once handled: otherwise every launch
// would open the same news item again.
export function useNotificationLinks() {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!response) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    Notifications.clearLastNotificationResponse();
    const url = response.notification.request.content.data?.url;
    if (typeof url !== 'string') return;
    isForMe(response.notification).then((mine) => {
      if (mine) router.push(url as never);
    });
  }, [response]);
}
