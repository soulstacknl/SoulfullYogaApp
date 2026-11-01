-- Soulful Yoga: schedule, customers, attendance.
-- Mirrors ScheduleData in lib/schedule.ts. Customers are referenced by user id
-- (not e-mail), so customers reading the schedule never see each other's details.

/* ── Customers ─────────────────────────────────────────────────────────── */

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null default '',
  phone text not null default '',
  role text not null default 'student' check (role in ('student', 'admin')),
  strippen integer check (strippen >= 0), -- null = no strip card yet
  total integer not null default 10,
  terms_accepted_at date,
  created_at timestamptz not null default now()
);

-- Admin check for policies; security definer so it can read profiles under RLS.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Every new auth user gets a customer profile (name from the sign-up metadata).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customers may edit their own name, phone and terms consent — never role or strips.
create function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for server-side SQL (migrations, seed), which may change anything.
  if auth.uid() is not null and not public.is_admin() and (
    new.role is distinct from old.role or new.strippen is distinct from old.strippen
    or new.total is distinct from old.total or new.email is distinct from old.email
  ) then
    raise exception 'Alleen de beheerder kan rol, e-mail of strippen aanpassen';
  end if;
  return new;
end;
$$;

create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

/* ── Schedule ──────────────────────────────────────────────────────────── */

-- A lesson slot in the weekly schedule; from = until is a one-off extra lesson.
create table public.sessions (
  id text primary key default gen_random_uuid()::text,
  day text not null check (day in ('Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag')),
  style text not null check (style in ('yin', 'flow', 'gentle')),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  capacity integer not null check (capacity >= 1),
  from_date date,
  until_date date,
  check (until_date is null or from_date is null or until_date >= from_date)
);

-- Standing customer of a weekly session for `weeks` weeks from `start_date` (99 = ongoing).
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  start_date date not null,
  weeks integer not null check (weeks >= 0),
  created_at timestamptz not null default now()
);

-- Approved one-off booking.
create table public.bookings (
  session_id text not null references public.sessions (id) on delete cascade,
  date date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (session_id, date, user_id)
);

-- One-off booking waiting for approval; already holds a spot.
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (id) on delete cascade,
  date date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, date, user_id)
);

-- Customer is off for one lesson date: doesn't count and costs no strip.
create table public.cancellations (
  session_id text not null references public.sessions (id) on delete cascade,
  date date not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  cancelled_by text not null check (cancelled_by in ('klant', 'beheer')),
  primary key (session_id, date, user_id)
);

-- Lessons that don't take place; session_id null = every lesson in the period.
create table public.closures (
  id uuid primary key default gen_random_uuid(),
  from_date date not null,
  to_date date not null check (to_date >= from_date),
  session_id text references public.sessions (id) on delete cascade,
  reason text not null default 'Vakantie'
);

-- Capacity for one lesson date when the admin changed it.
create table public.capacity_overrides (
  session_id text not null references public.sessions (id) on delete cascade,
  date date not null,
  capacity integer not null check (capacity >= 0),
  primary key (session_id, date)
);

-- Regular attendees without the app (data/roster.ts).
create table public.roster_entries (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (id) on delete cascade,
  name text not null,
  strips integer not null default 0 check (strips >= 0)
);

/* ── Attendance: strips are only deducted when the admin confirms ─────── */

-- Draft attendance list: present/absent marks and people the admin added.
create table public.attendance_drafts (
  session_id text not null references public.sessions (id) on delete cascade,
  date date not null,
  attendee_id text not null, -- user id, roster entry id or walk-in id
  name text,                 -- set for people the admin added
  uses_app boolean,
  walk_in boolean not null default false,
  added boolean not null default false,
  present boolean not null default true,
  primary key (session_id, date, attendee_id)
);

-- Confirmed lesson; its people are in attendance_records.
create table public.confirmations (
  session_id text not null references public.sessions (id) on delete cascade,
  date date not null,
  confirmed_at timestamptz not null default now(),
  confirmed_by uuid references public.profiles (id) on delete set null,
  primary key (session_id, date)
);

create table public.attendance_records (
  session_id text not null,
  date date not null,
  attendee_id text not null,
  user_id uuid references public.profiles (id) on delete cascade, -- set for app customers
  name text not null,
  uses_app boolean not null,
  walk_in boolean not null default false,
  planned boolean not null,
  present boolean not null,
  charge text check (charge in ('strip', 'open', 'los')),
  primary key (session_id, date, attendee_id),
  foreign key (session_id, date) references public.confirmations (session_id, date) on delete cascade
);

create index on public.enrollments (user_id);
create index on public.enrollments (session_id);
create index on public.cancellations (user_id);
create index on public.requests (user_id);
create index on public.attendance_records (user_id);

/* ── Row level security ────────────────────────────────────────────────── */

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.bookings enable row level security;
alter table public.requests enable row level security;
alter table public.cancellations enable row level security;
alter table public.closures enable row level security;
alter table public.capacity_overrides enable row level security;
alter table public.roster_entries enable row level security;
alter table public.attendance_drafts enable row level security;
alter table public.confirmations enable row level security;
alter table public.attendance_records enable row level security;

-- Profiles: your own, or all of them as admin.
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: admin deletes" on public.profiles
  for delete to authenticated using (public.is_admin());

-- The timetable is public (guests see the schedule too); only the admin changes it.
create policy "sessions: everyone reads" on public.sessions for select using (true);
create policy "sessions: admin writes" on public.sessions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "closures: everyone reads" on public.closures for select using (true);
create policy "closures: admin writes" on public.closures for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "capacity: everyone reads" on public.capacity_overrides for select using (true);
create policy "capacity: admin writes" on public.capacity_overrides for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Who-goes-when rows: logged-in customers read them (user ids only, needed to
-- count free spots); they only change their own, the admin changes everything.
create policy "enrollments: logged in reads" on public.enrollments for select to authenticated using (true);
create policy "enrollments: admin writes" on public.enrollments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "bookings: logged in reads" on public.bookings for select to authenticated using (true);
create policy "bookings: admin writes" on public.bookings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "requests: logged in reads" on public.requests for select to authenticated using (true);
create policy "requests: own insert" on public.requests for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());
create policy "requests: own or admin deletes" on public.requests for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "cancellations: logged in reads" on public.cancellations for select to authenticated using (true);
create policy "cancellations: own insert" on public.cancellations for insert to authenticated
  with check ((user_id = auth.uid() and cancelled_by = 'klant') or public.is_admin());
create policy "cancellations: own or admin deletes" on public.cancellations for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Roster without app and attendance drafts: admin only.
create policy "roster: admin" on public.roster_entries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "drafts: admin" on public.attendance_drafts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Confirmations: customers see their own records (for "Mijn lessen"), the admin all.
create policy "confirmations: logged in reads" on public.confirmations for select to authenticated using (true);
create policy "confirmations: admin writes" on public.confirmations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "records: own or admin reads" on public.attendance_records for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "records: admin writes" on public.attendance_records for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
