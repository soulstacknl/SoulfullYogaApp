// Mock account data — stands in for Supabase auth + the `users` table until that's connected.
export type UserRole = 'student' | 'admin';

export type MockUser = {
  email: string;
  password: string;
  name: string;
  phone: string;
  strippen: number | null; // null = no strippenkaart purchased yet
  total: number;
  role: UserRole;
};

export const mockUsers: MockUser[] = [
  {
    email: 'marieke@soulfulyoga.nl',
    password: 'yoga123',
    name: 'Marieke Jansen',
    phone: '06 12345678',
    strippen: 7,
    total: 10,
    role: 'student',
  },
  {
    email: 'daan@soulfulyoga.nl',
    password: 'yoga123',
    name: 'Daan de Vries',
    phone: '06 23456789',
    strippen: null,
    total: 10,
    role: 'student',
  },
  {
    email: 'beheer@soulfulyoga.nl',
    password: 'admin123',
    name: 'Studio Beheer',
    phone: '06 12680852',
    strippen: null,
    total: 10,
    role: 'admin',
  },
  {
    email: 'marjolijn_n@hotmail.com',
    password: '0000',
    name: 'Marjolijn N.',
    phone: '06 34567890',
    strippen: 5,
    total: 10,
    role: 'student',
  },
];
