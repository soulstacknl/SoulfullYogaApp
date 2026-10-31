import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/data/users';
import type { MockUser } from '@/data/users';

type UsersContextValue = {
  users: MockUser[];
  students: MockUser[];
  findUser: (email: string, password: string) => MockUser | undefined;
  adjustStrip: (email: string, delta: number) => void;
  applyStripDeltas: (deltas: Record<string, number>) => void;
  setTermsAccepted: (email: string, acceptedAt: string | null) => void;
};

const UsersContext = createContext<UsersContextValue | null>(null);

// Stands in for Supabase's `users` table until that's connected — a single
// mutable source of truth so admin edits (Strippenkaart beheren) are
// immediately visible to that customer's own logged-in session.
export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<MockUser[]>(mockUsers);

  const findUser = (email: string, password: string) =>
    users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  const updateUser = (email: string, updater: (user: MockUser) => MockUser) => {
    setUsers((prev) => prev.map((u) => (u.email !== email ? u : updater(u))));
  };

  const adjustStrip = (email: string, delta: number) => {
    updateUser(email, (u) => ({ ...u, strippen: Math.max(0, (u.strippen ?? 0) + delta) }));
  };

  // Used by the automatic deduction after finished lessons (see ScheduleContext).
  const applyStripDeltas = useCallback((deltas: Record<string, number>) => {
    setUsers((prev) =>
      prev.map((u) =>
        deltas[u.email] === undefined ? u : { ...u, strippen: Math.max(0, (u.strippen ?? 0) + deltas[u.email]) }
      )
    );
  }, []);

  const setTermsAccepted = (email: string, acceptedAt: string | null) => {
    updateUser(email, (u) => ({ ...u, termsAcceptedAt: acceptedAt }));
  };

  // Memoized: ScheduleContext's automatic-deduction effect depends on it.
  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

  return (
    <UsersContext.Provider
      value={{ users, students, findUser, adjustStrip, applyStripDeltas, setTermsAccepted }}>
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

// Combines the auth session (which email is logged in) with the live users
// list, so the returned user always reflects the latest admin edits.
export function useCurrentUser(): MockUser | null {
  const { email } = useAuth();
  const { users } = useUsers();
  return users.find((u) => u.email === email) ?? null;
}
