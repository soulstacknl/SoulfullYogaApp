-- Chat: besides text, the studio can send a payment request (amount, description and a
-- payment link from the bank or Tikkie) or a file (photo, video, pdf, ...). Only the studio
-- sends these; the customer can open them. The admin marks a payment request as paid.

alter table public.messages
  add column kind text not null default 'tekst' check (kind in ('tekst', 'betaalverzoek', 'bestand')),
  add column amount_cents integer check (amount_cents > 0),
  add column pay_url text check (pay_url ~ '^https://'),
  add column paid_at timestamptz,
  add column file_path text,
  add column file_type text,
  add column file_size bigint,
  add constraint messages_payment check (kind <> 'betaalverzoek' or (amount_cents is not null and pay_url is not null)),
  add constraint messages_file check (kind <> 'bestand' or file_path is not null);

drop policy "messages: customer or admin writes" on public.messages;
create policy "messages: customer or admin writes" on public.messages for insert to authenticated
  with check ((customer_id = auth.uid() and not from_studio and kind = 'tekst') or (public.is_admin() and from_studio));

-- Messages can't be edited (no update grant); paid goes through this.
create function public.set_payment_paid(p_message uuid, p_paid boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder'; end if;
  update public.messages set paid_at = case when p_paid then now() end
  where id = p_message and kind = 'betaalverzoek';
end;
$$;
revoke execute on function public.set_payment_paid(uuid, boolean) from public, anon;
grant execute on function public.set_payment_paid(uuid, boolean) to authenticated;

-- The push text says what was sent.
create or replace function public.push_new_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  text_line text := case new.kind
    when 'betaalverzoek' then '💶 Betaalverzoek € ' || replace(to_char(new.amount_cents / 100.0, 'FM999990.00'), '.', ',') || ' · ' || new.body
    when 'bestand' then case when new.file_type like 'image/%' then '🖼️ Foto: ' when new.file_type like 'video/%' then '🎬 Video: ' else '📄 Bestand: ' end || new.body
    else '💬 ' || new.body end;
begin
  if new.from_studio then
    perform public.push_to(array[new.customer_id], 'Marjolijn', text_line, jsonb_build_object('url', '/chat'));
  else
    perform public.push_to(
      array(select id from public.profiles where role = 'admin'),
      (select name from public.profiles where id = new.customer_id),
      text_line,
      jsonb_build_object('url', '/chat?klant=' || new.customer_id));
  end if;
  return new;
end;
$$;

-- Files: private bucket, one folder per customer ({customer id}/...). The admin uploads
-- and manages; a customer can only read their own folder (via signed URLs). Max 50 MB.
insert into storage.buckets (id, name, public, file_size_limit)
values ('chat', 'chat', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

create policy "chat files: admin manages" on storage.objects for all to authenticated
  using (bucket_id = 'chat' and public.is_admin()) with check (bucket_id = 'chat' and public.is_admin());
create policy "chat files: customer reads own" on storage.objects for select to authenticated
  using (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);

-- When an account is deleted the app first removes the files through the Storage API
-- (Supabase doesn't allow deleting storage objects with SQL): the admin for a customer,
-- a customer for their own account.
create policy "chat files: customer deletes own" on storage.objects for delete to authenticated
  using (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);
