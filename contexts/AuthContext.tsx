import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';

import { registerPush, unregisterPush } from '@/lib/push';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  ready: boolean; // false until the stored session has been read
  email: string | null;
  userId: string | null;
  // True after opening a password-reset link: the app asks for a new password.
  recovering: boolean;
  login: (email: string, password: string) => Promise<string | null>; // error message or null
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Where the reset e-mail sends people back to: the app's own "new password" screen.
export const resetRedirectUrl = () =>
  Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}/wachtwoord-instellen`
    : Linking.createURL('wachtwoord-instellen');

const loginError = (message: string) =>
  /invalid login credentials/i.test(message) ? 'Onjuist e-mailadres of wachtwoord.' : message;

// Native: a reset link opens the app with the session tokens in the URL fragment.
async function sessionFromLink(url: string | null) {
  if (!url || !url.includes('access_token')) return;
  const params = new URLSearchParams(url.split('#')[1] ?? '');
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) await supabase.auth.setSession({ access_token, refresh_token });
}

// Supabase auth session (persisted on the device) — see lib/supabase.ts.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
    });
    let linkSub: { remove: () => void } | undefined;
    if (Platform.OS !== 'web') {
      Linking.getInitialURL().then(sessionFromLink);
      linkSub = Linking.addEventListener('url', ({ url }) => {
        if (url.includes('type=recovery')) setRecovering(true);
        sessionFromLink(url);
      });
    }
    return () => {
      listener.subscription.unsubscribe();
      linkSub?.remove();
    };
  }, []);

  // Lesson reminders: link this device to whoever is logged in.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (userId) registerPush();
  }, [userId]);

  const value: AuthContextValue = {
    ready,
    email: session?.user.email ?? null,
    userId,
    recovering,
    login: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? loginError(error.message) : null;
    },
    logout: async () => {
      await unregisterPush();
      await supabase.auth.signOut();
    },
    sendPasswordReset: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetRedirectUrl() });
      return error ? error.message : null;
    },
    updatePassword: async (password) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) setRecovering(false);
      return error ? error.message : null;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
