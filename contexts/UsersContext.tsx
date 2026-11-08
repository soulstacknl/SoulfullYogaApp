import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import type { AppUser, CustomerOrigin } from '@/data/users';
import type { AccountRequest } from '@/lib/remote';
import { inboxRemote } from '@/lib/inbox';
import { remote } from '@/lib/remote';

type UsersContextValue = {
  users: AppUser[];
  students: AppUser[];
  userIdOf: (email: string) => string | undefined;
  adjustStrip: (email: string, delta: number) => void;
  activateCard: (email: string) => void;
  // Private-lesson strips: a separate card the admin keeps up by hand.
  adjustPrivateStrips: (email: string, delta: number) => void;
  removePrivateCard: (email: string) => void;
  setTermsAccepted: (email: string, acceptedAt: string | null) => void;
  // origin 'aanvraag': the customer also gets a mail to set a password for the app.
  createCustomer: (name: string, email: string, phone: string, origin: CustomerOrigin) => Promise<boolean>;
  deleteCustomer: (email: string) => Promise<boolean>;
  // Account requests from the app (admin): approve creates the customer and sends the password mail.
  accountRequests: AccountRequest[];
  approveAccountRequest: (id: string) => Promise<boolean>;
  rejectAccountRequest: (id: string) => Promise<boolean>;
  deleteOwnAccount: () => Promise<boolean>;
};

export const CARD_SIZE = 10;

const UsersContext = createContext<UsersContextValue | null>(null);

// Customer profiles from Supabase: a customer sees only themselves, the admin everyone.
export function UsersProvider({ children }: { children: ReactNode }) {
  const { users, run, accountRequests } = useData();
  const { sendPasswordReset, userId } = useAuth();
  const byEmail = (email: string) => users.find((u) => u.email === email);

  const adjustStrip = (email: string, delta: number) => {
    const user = byEmail(email);
    if (user) run(() => remote.adjustStrips(user.id, delta));
  };

  // A new 10-strip card on top of what's left (the database keeps total in step and
  // starts the 4 months of validity again, as + does).
  const activateCard = (email: string) => {
    const user = byEmail(email);
    if (user) run(() => remote.activateCard(user.id));
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
        adjustPrivateStrips: (email, delta) => {
          const user = byEmail(email);
          if (user) run(() => remote.adjustPrivateStrips(user.id, delta));
        },
        removePrivateCard: (email) => {
          const user = byEmail(email);
          if (user) run(() => remote.removePrivateCard(user.id));
        },
        setTermsAccepted,
        createCustomer: async (name, email, phone, origin) => {
          const ok = await run(() => remote.createCustomer(name, email, phone, origin));
          if (ok && origin === 'aanvraag') await sendPasswordReset(email);
          return ok;
        },
        accountRequests,
        approveAccountRequest: async (id) => {
          let email = '';
          const ok = await run(async () => {
            email = await remote.approveAccountRequest(id);
          });
          if (ok && email) await sendPasswordReset(email);
          return ok;
        },
        rejectAccountRequest: (id) => run(() => remote.rejectAccountRequest(id)),
        deleteCustomer: async (email) => {
          const user = byEmail(email);
          return (
            !!user &&
            run(async () => {
              await inboxRemote.removeFilesOf(user.id);
              await remote.deleteCustomer(user.id);
            })
          );
        },
        deleteOwnAccount: () =>
          run(async () => {
            if (userId) await inboxRemote.removeFilesOf(userId);
            await remote.deleteOwnAccount();
          }),
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
