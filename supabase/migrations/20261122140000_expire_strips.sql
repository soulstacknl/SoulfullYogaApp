-- Strips that are left when the card's end date has passed go to 0. This is logged in
-- the strip history (kind 'vervallen'), so admin and customer see why the strips went.
-- Runs every hour; a card expires the day after its "geldig t/m" date (Amsterdam time).
alter table public.strip_events drop constraint strip_events_kind_check;
alter table public.strip_events add constraint strip_events_kind_check check (kind in ('kaart', 'aanpassing', 'vervallen'));

create function public.expire_strip_cards() returns integer
language plpgsql security definer set search_path = public as $$
declare
  local_today date := (now() at time zone 'Europe/Amsterdam')::date;
  n integer;
begin
  with expired as (
    select id, strippen from public.profiles
    where strippen > 0 and strips_valid_until is not null and strips_valid_until < local_today
    for update
  ), logged as (
    insert into public.strip_events (user_id, card, kind, delta, balance)
    select id, 'groep', 'vervallen', -strippen, 0 from expired
  )
  update public.profiles p set strippen = 0 from expired e where p.id = e.id;
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke execute on function public.expire_strip_cards() from public, anon, authenticated;

select cron.schedule('expire-strip-cards', '5 * * * *', 'select public.expire_strip_cards()');
