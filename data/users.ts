// Mock account data — stands in for Supabase auth + the `users` table until that's connected.
export type UserRole = 'student' | 'admin';

export type MockUser = {
  email: string;
  password: string;
  name: string;
  strippen: number | null; // null = no strippenkaart purchased yet
  total: number;
  role: UserRole;
};

export const mockUsers: MockUser[] = [
  {
    email: 'marieke@soulfulyoga.nl',
    password: 'yoga123',
    name: 'Marieke Jansen',
    strippen: 7,
    total: 10,
    role: 'student',
  },
  {
    email: 'daan@soulfulyoga.nl',
    password: 'yoga123',
    name: 'Daan de Vries',
    strippen: null,
    total: 10,
    role: 'student',
  },
  {
    email: 'beheer@soulfulyoga.nl',
    password: 'admin123',
    name: 'Studio Beheer',
    strippen: null,
    total: 10,
    role: 'admin',
  },
  {
    email: 'marjolijn_n@hotmail.com',
    password: '0000',
    name: 'Marjolijn N.',
    strippen: 5,
    total: 10,
    role: 'student',
  },
];
