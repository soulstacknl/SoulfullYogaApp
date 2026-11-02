// Berichten: news for everyone and the 1-op-1 chat between a customer and the studio.
// Customers only get their own conversation (row level security); the admin gets all.
import { supabase } from '@/lib/supabase';

export type NewsItem = { id: string; title: string; body: string; push: boolean; at: string };
export type Message = { id: string; customerId: string; fromStudio: boolean; body: string; at: string };
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
    messages: (messages?.data ?? []).map((m) => ({ id: m.id, customerId: m.customer_id, fromStudio: m.from_studio, body: m.body, at: m.created_at })),
    reads: Object.fromEntries((reads?.data ?? []).map((r) => [r.customer_id, { customer: r.customer_read_at ?? '', studio: r.studio_read_at ?? '' }])),
    newsReadAt: profile?.data?.news_read_at ?? '',
  };
}

export const inboxRemote = {
  sendMessage: (customerId: string, fromStudio: boolean, body: string) =>
    check(supabase.from('messages').insert({ customer_id: customerId, from_studio: fromStudio, body })),
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
