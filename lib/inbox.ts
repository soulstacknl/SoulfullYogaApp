// Berichten: news for everyone and the 1-op-1 chat between a customer and the studio.
// Customers only get their own conversation (row level security); the admin gets all.
import { supabase } from '@/lib/supabase';

export type NewsItem = { id: string; title: string; body: string; push: boolean; at: string };
// kind 'betaalverzoek': body = description, plus amount and payment link; 'bestand': body =
// file name, the file itself is in the private storage bucket 'chat' ({customer id}/...).
export type Message = {
  id: string;
  customerId: string;
  fromStudio: boolean;
  body: string;
  at: string;
  kind: 'tekst' | 'betaalverzoek' | 'bestand';
  amountCents?: number;
  payUrl?: string;
  paidAt?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
};
// A file chosen to send: uri on the phone, or the File object in the browser.
export type ChosenFile = { name: string; type: string; size: number; uri: string; file?: Blob };

export const MAX_FILE_BYTES = 50 * 1024 * 1024;
// "€ 110,00"
export const euro = (cents: number) => `€ ${(cents / 100).toFixed(2).replace('.', ',')}`;
export const fileSizeLabel = (bytes?: number) =>
  !bytes ? '' : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} kB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
export const fileIcon = (type?: string) => (type?.startsWith('image/') ? '🖼️' : type?.startsWith('video/') ? '🎬' : '📄');
// One line in the conversation list.
export const messagePreview = (m: Message) =>
  m.kind === 'betaalverzoek'
    ? `💶 Betaalverzoek ${euro(m.amountCents ?? 0)}`
    : m.kind === 'bestand'
      ? `${fileIcon(m.fileType)} ${m.body}`
      : m.body;
// Up to when each side read a conversation (ISO timestamps, '' = never).
export type ChatRead = { customer: string; studio: string };
export type Inbox = { news: NewsItem[]; messages: Message[]; reads: Record<string, ChatRead>; newsReadAt: string };

export const emptyInbox = (): Inbox => ({ news: [], messages: [], reads: {}, newsReadAt: '' });

async function check<T extends { error: { message: string } | null }>(query: PromiseLike<T>) {
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function loadInbox(userId: string | null): Promise<Inbox> {
  const [news, messages, reads, profile] = await Promise.all([
    supabase.from('news').select('*').order('created_at', { ascending: false }),
    userId ? supabase.from('messages').select('*').order('created_at') : null,
    userId ? supabase.from('chat_reads').select('*') : null,
    userId ? supabase.from('profiles').select('news_read_at').eq('id', userId).maybeSingle() : null,
  ]);
  return {
    news: (news.data ?? []).map((n) => ({ id: n.id, title: n.title, body: n.body, push: n.push, at: n.created_at })),
    messages: (messages?.data ?? []).map((m) => ({
      id: m.id,
      customerId: m.customer_id,
      fromStudio: m.from_studio,
      body: m.body,
      at: m.created_at,
      kind: m.kind ?? 'tekst',
      amountCents: m.amount_cents ?? undefined,
      payUrl: m.pay_url ?? undefined,
      paidAt: m.paid_at ?? undefined,
      filePath: m.file_path ?? undefined,
      fileType: m.file_type ?? undefined,
      fileSize: m.file_size ?? undefined,
    })),
    reads: Object.fromEntries((reads?.data ?? []).map((r) => [r.customer_id, { customer: r.customer_read_at ?? '', studio: r.studio_read_at ?? '' }])),
    newsReadAt: profile?.data?.news_read_at ?? '',
  };
}

export const inboxRemote = {
  sendMessage: (customerId: string, fromStudio: boolean, body: string) =>
    check(supabase.from('messages').insert({ customer_id: customerId, from_studio: fromStudio, body })),
  sendPayment: (customerId: string, description: string, amountCents: number, payUrl: string) =>
    check(
      supabase.from('messages').insert({
        customer_id: customerId, from_studio: true, kind: 'betaalverzoek', body: description, amount_cents: amountCents, pay_url: payUrl,
      })
    ),
  setPaid: (messageId: string, paid: boolean) => check(supabase.rpc('set_payment_paid', { p_message: messageId, p_paid: paid })),
  // Upload first, then the message that points to it.
  async sendFile(customerId: string, f: ChosenFile) {
    const safe = f.name.replace(/[^\w.\-]+/g, '_').slice(-80) || 'bestand';
    const path = `${customerId}/${Date.now()}-${safe}`;
    const data = f.file ?? (await (await fetch(f.uri)).arrayBuffer());
    const { error } = await supabase.storage.from('chat').upload(path, data, { contentType: f.type });
    if (error) throw new Error(error.message);
    await check(
      supabase.from('messages').insert({
        customer_id: customerId, from_studio: true, kind: 'bestand', body: f.name.slice(0, 200), file_path: path, file_type: f.type, file_size: f.size,
      })
    );
  },
  // Files are private: opening one goes through a link that works for an hour.
  async fileUrl(path: string) {
    const { data, error } = await supabase.storage.from('chat').createSignedUrl(path, 3600);
    if (error) throw new Error(error.message);
    return data.signedUrl;
  },
  // Before deleting an account (Supabase only deletes storage files through the API).
  async removeFilesOf(customerId: string) {
    const { data } = await supabase.storage.from('chat').list(customerId, { limit: 1000 });
    if (data?.length) await supabase.storage.from('chat').remove(data.map((o) => `${customerId}/${o.name}`));
  },
  markChatRead: (customerId: string) => check(supabase.rpc('mark_chat_read', { p_customer: customerId })),
  markNewsRead: (userId: string) => check(supabase.from('profiles').update({ news_read_at: new Date().toISOString() }).eq('id', userId)),
  postNews: (title: string, body: string, push: boolean) => check(supabase.from('news').insert({ title, body, push })),
  updateNews: (id: string, title: string, body: string) => check(supabase.from('news').update({ title, body }).eq('id', id)),
  deleteNews: (id: string) => check(supabase.from('news').delete().eq('id', id)),
};

// "14.05", "gisteren 14.05" or "12 jun" — how long ago a message was sent.
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
export function msgTime(iso: string, now = new Date()) {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
  const days = Math.round((dayStart(now) - dayStart(d)) / 86400000);
  return days <= 0 ? time : days === 1 ? `gisteren ${time}` : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export const clockTime = (iso: string) => msgTime(iso, new Date(iso));
