// Profile photos: a private bucket with one folder per customer. The customer uploads their
// own photo; the admin sees every photo. Links work for an hour and are cached meanwhile.
import { supabase } from '@/lib/supabase';

export const MAX_AVATAR_BYTES = 10 * 1024 * 1024;

export type ChosenImage = { name: string; type: string; size: number; uri: string; file?: File };

const cache = new Map<string, { url: string; until: number }>();

export async function avatarUrl(path: string): Promise<string | null> {
  const hit = cache.get(path);
  if (hit && hit.until > Date.now()) return hit.url;
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 3600);
  if (error || !data) return null;
  cache.set(path, { url: data.signedUrl, until: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
}

// Uploads the new photo under a new name (so no old copy is shown from a cache), points the
// profile to it and removes the previous photo.
export async function uploadAvatar(userId: string, image: ChosenImage, previous: string | null) {
  const ext = (image.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const data = image.file ?? (await (await fetch(image.uri)).arrayBuffer());
  const { error } = await supabase.storage.from('avatars').upload(path, data, { contentType: image.type });
  if (error) throw new Error(error.message);
  const { error: profileError } = await supabase.from('profiles').update({ avatar_path: path }).eq('id', userId);
  if (profileError) throw new Error(profileError.message);
  if (previous) await supabase.storage.from('avatars').remove([previous]);
}

export async function removeAvatar(userId: string, path: string) {
  const { error } = await supabase.from('profiles').update({ avatar_path: null }).eq('id', userId);
  if (error) throw new Error(error.message);
  await supabase.storage.from('avatars').remove([path]);
}

// Before deleting an account (storage files only go through the API).
export async function removeAvatarsOf(userId: string) {
  const { data } = await supabase.storage.from('avatars').list(userId, { limit: 100 });
  if (data?.length) await supabase.storage.from('avatars').remove(data.map((o) => `${userId}/${o.name}`));
}
