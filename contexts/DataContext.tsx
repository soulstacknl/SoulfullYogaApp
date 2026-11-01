import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Platform } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import type { AppUser } from '@/data/users';
import { loadSnapshot } from '@/lib/remote';
import type { ScheduleData } from '@/lib/schedule';
import { emptyScheduleData } from '@/lib/schedule';
import { supabase } from '@/lib/supabase';

type DataContextValue = {
  loading: boolean; // true until the first load for the current session finished
  users: AppUser[];
  data: ScheduleData;
  // Runs a write and reloads afterwards; a failure is shown to the user.
  run: (write: () => Promise<unknown>) => Promise<boolean>;
};

const DataContext = createContext<DataContextValue | null>(null);

const showError = (message: string) => {
  if (Platform.OS === 'web') window.alert(`Opslaan mislukt: ${message}`);
  else Alert.alert('Opslaan mislukt', message);
};

// Everything the signed-in user may see, loaded from Supabase. Reloads when the
// session changes and when another device changes data (Supabase Realtime).
export function DataProvider({ children }: { children: ReactNode }) {
  const { ready, userId } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [data, setData] = useState<ScheduleData>(emptyScheduleData);
  const [loading, setLoading] = useState(true);
  const loadId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++loadId.current;
    const snapshot = await loadSnapshot();
    if (id !== loadId.current) return; // a newer load is under way
    setUsers(snapshot.users);
    setData(snapshot.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    reload();
    // Changes from other devices: reload shortly after the last one.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const channel = supabase
      .channel(`data-${userId ?? 'guest'}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        clearTimeout(timer);
        timer = setTimeout(reload, 300);
      })
      .subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [ready, userId, reload]);

  const run = async (write: () => Promise<unknown>) => {
    try {
      await write();
      return true;
    } catch (e) {
      showError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      await reload();
    }
  };

  return <DataContext.Provider value={{ loading, users, data, run }}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
