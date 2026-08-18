import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type AuthContextValue = {
  email: string | null;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Stands in for Supabase auth session state until that's connected — holds
// just the logged-in email; the live user record is derived elsewhere (see
// useCurrentUser in UsersContext) so admin edits to strip balances show up
// immediately rather than being frozen at login time.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ email, login: setEmail, logout: () => setEmail(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
