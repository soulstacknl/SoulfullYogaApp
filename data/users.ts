// A signed-in person: the auth account plus their profile row in Supabase.
export type UserRole = 'student' | 'admin';
// How a customer came in: via an account request (uses the app) or added by hand by the admin.
export type CustomerOrigin = 'aanvraag' | 'beheer';

export type AppUser = {
  id: string; // Supabase auth user id
  email: string;
  name: string;
  phone: string;
  strippen: number | null; // null = no strippenkaart purchased yet
  total: number;
  role: UserRole;
  termsAcceptedAt: string | null; // DD-MM-YYYY when the customer agreed to the algemene voorwaarden
  origin: CustomerOrigin;
};

// Customers added without an e-mail address get a placeholder on this (never delivered) domain.
const NO_EMAIL_DOMAIN = '@soulfulyoga.invalid';
export const hasEmail = (email: string) => !email.endsWith(NO_EMAIL_DOMAIN);
// Label and colour for how a customer came in (green = account request, yellow = added by hand).
export const ORIGIN_LABEL: Record<CustomerOrigin, string> = { aanvraag: 'Via accountaanvraag', beheer: 'Handmatig toegevoegd' };
export const ORIGIN_TONE = { aanvraag: 'teal', beheer: 'pending' } as const;
export const shownEmail = (email: string) => (hasEmail(email) ? email : 'geen e-mailadres');
