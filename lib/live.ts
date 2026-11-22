import type { RealtimeChannel } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { onPushReceived } from '@/lib/push';
import { supabase } from '@/lib/supabase';

// Keeps loaded data in step with the database. Realtime alone is not enough on a phone:
// the operating system closes the live connection while the app is in the background,
// and events sent meanwhile are lost. So, besides Realtime, this reloads when:
// - the app comes back to the foreground (and the live connection is set up again);
// - a push notification arrives (a new message or booking is on its way);
// - the live connection is (re)established, to catch up on what it missed.
// Returns the clean-up function.
export function keepLive(
  name: string,
  listen: (channel: RealtimeChannel, changed: () => void) => RealtimeChannel,
  reload: () => void,
  delay = 250
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let channel: RealtimeChannel | null = null;
  let count = 0;
  const changed = () => {
    clearTimeout(timer);
    timer = setTimeout(reload, delay);
  };
  const connect = () => {
    if (channel) supabase.removeChannel(channel);
    let first = true;
    channel = listen(supabase.channel(`${name}-${++count}`), changed).subscribe((status) => {
      if (status !== 'SUBSCRIBED') return;
      // The first subscribe follows the initial load; later ones are reconnects.
      if (!first) changed();
      first = false;
    });
  };
  connect();
  const appState = AppState.addEventListener('change', (state) => {
    if (state !== 'active') return;
    connect();
    changed();
  });
  const offPush = onPushReceived(changed);
  return () => {
    clearTimeout(timer);
    appState.remove();
    offPush();
    if (channel) supabase.removeChannel(channel);
  };
}
