-- Soulful Yoga — Supabase schema
--
-- STATUS: not yet applied. This project has no live Supabase connection —
-- everything in the app is still local mock state (see data/*.ts and
-- contexts/*.tsx). This file documents the schema described in
-- soulful-yoga-app-spec.md, including the Docentmodus additions (`role` on
-- users, `checked_in` booking status, and the admin-only RLS policies), so
-- it's ready to run as-is the day a real Supabase project is connected.

create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  strip_balance int not null default 0,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  capacity int not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  class_date date not null,
  status text not null default 'booked' check (status in ('booked', 'cancelled', 'checked_in')),
  created_at timestamptz not null default now()
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  style text not null check (style in ('yin', 'flow', 'gentle')),
  duration_minutes int not null,
  level text not null,
  video_url text not null,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  type text not null check (type in ('single_class', 'strip_10')),
  amount numeric(10, 2) not null,
  mollie_payment_id text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row-level security
--
-- Everyone can read their own row and the shared schedule/video catalog.
-- Only role = 'admin' may write another user's strip_balance or a booking's
-- status (the two actions Docentmodus performs: check-in and manual strip
-- correction). Regular users can still create/cancel their own bookings.
-- ---------------------------------------------------------------------------

alter table users enable row level security;
alter table classes enable row level security;
alter table bookings enable row level security;
alter table videos enable row level security;
alter table purchases enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  );
$$;

-- users: everyone can read all profiles (needed for roster display of names),
-- but can only update their own row — unless they're an admin adjusting
-- someone else's strip_balance.
create policy "users_select_all" on users for select using (true);

create policy "users_update_self" on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_update_strip_balance_admin" on users for update
  using (is_admin())
  with check (is_admin());

-- classes: readable by everyone, writable only by admins (capacity edits).
create policy "classes_select_all" on classes for select using (true);
create policy "classes_write_admin" on classes for all using (is_admin()) with check (is_admin());

-- bookings: a user can read/insert/cancel their own bookings; admins can
-- read and update any booking (needed to set status = 'checked_in').
create policy "bookings_select_own_or_admin" on bookings for select
  using (auth.uid() = user_id or is_admin());

create policy "bookings_insert_own" on bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_update_own_status_booked_cancelled" on bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('booked', 'cancelled'));

create policy "bookings_update_status_admin" on bookings for update
  using (is_admin())
  with check (is_admin());

-- videos: readable by any authenticated user, no client writes.
create policy "videos_select_authenticated" on videos for select using (auth.uid() is not null);

-- purchases: a user can read/insert their own purchase history only.
create policy "purchases_select_own" on purchases for select using (auth.uid() = user_id);
create policy "purchases_insert_own" on purchases for insert with check (auth.uid() = user_id);
