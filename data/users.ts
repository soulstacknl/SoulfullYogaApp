// A signed-in person: the auth account plus their profile row in Supabase.
export type UserRole = 'student' | 'admin';

export type AppUser = {
  id: string; // Supabase auth user id
  email: string;
  name: string;
  phone: string;
  strippen: number | null; // null = no strippenkaart purchased yet
  total: number;
  role: UserRole;
  termsAcceptedAt: string | null; // DD-MM-YYYY when the customer agreed to the algemene voorwaarden
};
