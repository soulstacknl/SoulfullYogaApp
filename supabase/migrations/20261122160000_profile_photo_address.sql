-- The customer fills in their own profile photo, phone number and (optional) address on
-- Profiel. The admin sees the photo and address per customer under Klanten.
alter table public.profiles
  add column avatar_path text,
  add column address text not null default '',
  add column postcode text not null default '',
  add column city text not null default '';

-- Private bucket: one folder per customer. The customer manages their own photo, the
-- admin can see every photo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif'])
on conflict (id) do nothing;

create policy "avatars: own folder" on storage.objects for all
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: admin reads" on storage.objects for select
  using (bucket_id = 'avatars' and public.is_admin());
create policy "avatars: admin deletes" on storage.objects for delete
  using (bucket_id = 'avatars' and public.is_admin());
