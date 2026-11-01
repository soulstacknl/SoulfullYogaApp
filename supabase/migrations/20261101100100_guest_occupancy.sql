-- Guests see real free spots in the timetable: they may read who-goes-when rows,
-- which hold only user ids (no names or e-mail addresses), like logged-in customers.
grant select on public.enrollments, public.bookings, public.requests, public.cancellations to anon;

create policy "enrollments: guests read" on public.enrollments for select to anon using (true);
create policy "bookings: guests read" on public.bookings for select to anon using (true);
create policy "requests: guests read" on public.requests for select to anon using (true);
create policy "cancellations: guests read" on public.cancellations for select to anon using (true);
