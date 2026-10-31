import { createContext, useContext } from 'react';

import type { ConfirmRequest } from '@/components/ConfirmDialog';

export type PortalDrawer = { type: 'les'; sessionId: string; date: string } | { type: 'klant'; email: string } | null;

type PortalContextValue = {
  toast: (message: string) => void;
  confirm: (request: ConfirmRequest) => void;
  openLesson: (sessionId: string, date: string) => void;
  // Opens the customer panel; `onKlanten` also switches to the Klanten page.
  openKlant: (email: string, onKlanten?: boolean) => void;
  closeDrawer: () => void;
  toPresentie: (sessionId: string, date: string) => void;
};

export const PortalContext = createContext<PortalContextValue | null>(null);

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within the portal layout');
  return ctx;
}
