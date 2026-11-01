-- Table privileges for the API roles. New Supabase projects no longer grant these
-- by default; row level security (see the schema migration) still decides which rows.

-- Guests (anon) only see the timetable.
grant select on public.sessions, public.closures, public.capacity_overrides to anon;

-- Logged-in users: full table access, narrowed per row by the policies.
grant select, insert, update, delete on
  public.profiles, public.sessions, public.enrollments, public.bookings, public.requests,
  public.cancellations, public.closures, public.capacity_overrides, public.roster_entries,
  public.attendance_drafts, public.confirmations, public.attendance_records
to authenticated;

grant execute on function public.is_admin() to authenticated;
