import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Platform } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/contexts/UsersContext';
import type { ChosenFile, Inbox, Message, NewsItem } from '@/lib/inbox';
import { emptyInbox, inboxRemote, loadInbox } from '@/lib/inbox';
import { supabase } from '@/lib/supabase';

export type Conversation = { customerId: string; last: Message; unread: number };

type InboxContextValue = {
  news: NewsItem[];
  isNewsUnread: (item: NewsItem) => boolean;
  messagesOf: (customerId: string) => Message[];
  // Admin: all conversations, latest first.
  conversations: Conversation[];
  // Red number on the Berichten tab: unread news + chat (admin: conversations with new messages).
  badge: number;
  unreadChat: number;
  // "Gelezen" under your own message: has the other side opened the conversation since?
  seenByOther: (m: Message) => boolean;
  send: (customerId: string, body: string) => Promise<boolean>;
  // Studio only: a payment request with a payment link, or a file (photo, video, pdf…).
  sendPayment: (customerId: string, description: string, amountCents: number, payUrl: string) => Promise<boolean>;
  sendFile: (customerId: string, file: ChosenFile) => Promise<boolean>;
  setPaid: (messageId: string, paid: boolean) => Promise<boolean>;
  fileUrl: (path: string) => Promise<string>;
  markChatRead: (customerId: string) => void;
  markNewsRead: () => void;
  postNews: (title: string, body: string, push: boolean) => Promise<boolean>;
  updateNews: (id: string, title: string, body: string) => Promise<boolean>;
  deleteNews: (id: string) => Promise<boolean>;
};

const InboxContext = createContext<InboxContextValue | null>(null);

const showError = (message: string) => {
  if (Platform.OS === 'web') window.alert(`Versturen mislukt: ${message}`);
  else Alert.alert('Versturen mislukt', message);
};

// News and chat, loaded from Supabase and kept live with Realtime.
export function InboxProvider({ children }: { children: ReactNode }) {
  const { ready, userId } = useAuth();
  const user = useCurrentUser();
  const isAdmin = user?.role === 'admin';
  const [inbox, setInbox] = useState<Inbox>(emptyInbox);
  const loadId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++loadId.current;
    const next = await loadInbox(userId);
    if (id === loadId.current) setInbox(next);
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    reload();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const later = () => {
      clearTimeout(timer);
      timer = setTimeout(reload, 200);
    };
    const channel = supabase
      .channel(`inbox-${userId ?? 'guest'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, later)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_reads' }, later)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, later)
      .subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [ready, userId, reload]);

  const run = useCallback(
    async (write: () => Promise<unknown>) => {
      try {
        await write();
        return true;
      } catch (e) {
        showError(e instanceof Error ? e.message : String(e));
        return false;
      } finally {
        await reload();
      }
    },
    [reload]
  );

  const value = useMemo<InboxContextValue>(() => {
    const { news, messages, reads, newsReadAt } = inbox;
    const messagesOf = (customerId: string) => messages.filter((m) => m.customerId === customerId);
    const unreadFor = (customerId: string, studio: boolean) => {
      const readAt = (studio ? reads[customerId]?.studio : reads[customerId]?.customer) ?? '';
      return messagesOf(customerId).filter((m) => m.fromStudio !== studio && m.at > readAt).length;
    };
    const ids = [...new Set(messages.map((m) => m.customerId))];
    const conversations = isAdmin
      ? ids
          .map((customerId) => ({ customerId, last: messagesOf(customerId).at(-1)!, unread: unreadFor(customerId, true) }))
          .sort((a, b) => b.last.at.localeCompare(a.last.at))
      : [];
    const isNewsUnread = (item: NewsItem) => !!userId && !isAdmin && item.at > newsReadAt;
    const unreadChat = userId && !isAdmin ? unreadFor(userId, false) : 0;
    const badge = isAdmin ? conversations.filter((c) => c.unread).length : news.filter(isNewsUnread).length + unreadChat;

    return {
      news,
      isNewsUnread,
      messagesOf,
      conversations,
      badge,
      unreadChat,
      seenByOther: (m) => {
        const r = reads[m.customerId];
        return m.at <= ((m.fromStudio ? r?.customer : r?.studio) ?? '');
      },
      send: (customerId, body) => run(() => inboxRemote.sendMessage(customerId, isAdmin, body)),
      sendPayment: (customerId, description, amountCents, payUrl) =>
        run(() => inboxRemote.sendPayment(customerId, description, amountCents, payUrl)),
      sendFile: (customerId, file) => run(() => inboxRemote.sendFile(customerId, file)),
      setPaid: (messageId, paid) => run(() => inboxRemote.setPaid(messageId, paid)),
      fileUrl: (path) => inboxRemote.fileUrl(path),
      markChatRead: (customerId) => {
        if (unreadFor(customerId, isAdmin)) run(() => inboxRemote.markChatRead(customerId));
      },
      markNewsRead: () => {
        if (userId && !isAdmin && news.some(isNewsUnread)) run(() => inboxRemote.markNewsRead(userId));
      },
      postNews: (title, body, push) => run(() => inboxRemote.postNews(title, body, push)),
      updateNews: (id, title, body) => run(() => inboxRemote.updateNews(id, title, body)),
      deleteNews: (id) => run(() => inboxRemote.deleteNews(id)),
    };
  }, [inbox, isAdmin, userId, run]);

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error('useInbox must be used within an InboxProvider');
  return ctx;
}
