import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import type { AppUser } from '@/data/users';
import { remote } from '@/lib/remote';

type UsersContextValue = {
  users: AppUser[];
  students: AppUser[];
  userIdOf: (email: string) => string | undefined;
  adjustStrip: (email: string, delta: number) => void;
  activateCard: (email: string) => void;
  setTermsAccepted: (email: string, acceptedAt: string | null) => void;
  createCustomer: (email: string, name: string, phone: string) => Promise<boolean>;
  deleteOwnAccount: () => Promise<boolean>;
};

export const CARD_SIZE = 10;

const UsersContext = createContext<UsersContextValue | null>(null);

// Customer profiles from Supabase: a customer sees only themselves, the admin everyone.
export function UsersProvider({ children }: { children: ReactNode }) {
  const { users, run } = useData();
  const byEmail = (email: string) => users.find((u) => u.email === email);

  const adjustStrip = (email: string, delta: number) => {
    const user = byEmail(email);
    if (user) run(() => remote.setStrips(user.id, Math.max(0, (user.strippen ?? 0) + delta)));
  };

  // A new 10-strip card on top of what's left; total follows so the card never shows e.g. 12 / 10.
  const activateCard = (email: string) => {
    const user = byEmail(email);
    if (!user) return;
    const strippen = (user.strippen ?? 0) + CARD_SIZE;
    run(() => remote.setStrips(user.id, strippen, Math.max(CARD_SIZE, strippen)));
  };

  const setTermsAccepted = (email: string, acceptedAt: string | null) => {
    const user = byEmail(email);
    if (user) run(() => remote.setTermsAccepted(user.id, acceptedAt));
  };

  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

  return (
    <UsersContext.Provider
      value={{
        users,
        students,
        userIdOf: (email) => byEmail(email)?.id,
        adjustStrip,
        activateCard,
        setTermsAccepted,
        createCustomer: (email, name, phone) => run(() => remote.createCustomer(email, name, phone)),
        deleteOwnAccount: () => run(() => remote.deleteOwnAccount()),
      }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return ctx;
}

// The signed-in user's live profile (null for guests).
export function useCurrentUser(): AppUser | null {
  const { userId } = useAuth();
  const { users } = useUsers();
  return users.find((u) => u.id === userId) ?? null;
}
