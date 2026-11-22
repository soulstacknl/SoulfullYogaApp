-- A waitlist only matters until the lesson starts: afterwards its entries are removed.
create or replace function public.clean_waitlist() returns void
language sql security definer set search_path = public as $$
  delete from public.waitlist w
  using public.sessions s
  where s.id = w.session_id
    and (w.date + s.start_time) <= (now() at time zone 'Europe/Amsterdam');
$$;
revoke execute on function public.clean_waitlist() from public, anon, authenticated;

select public.clean_waitlist();
select cron.schedule('clean-waitlist', '10 * * * *', 'select public.clean_waitlist()');
