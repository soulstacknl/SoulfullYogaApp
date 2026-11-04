import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChatRow, NewsCard, SectionHead, TEACHER_NAME } from '@/components/BerichtenParts';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import ScreenHeader from '@/components/ScreenHeader';
import Toast, { useToast } from '@/components/Toast';
import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';
import { useCurrentUser, useUsers } from '@/contexts/UsersContext';
import { msgTime } from '@/lib/inbox';

// Chat with Marjolijn on top, news below. The admin sees all conversations instead.
export default function BerichtenScreen() {
  const user = useCurrentUser();
  const { users } = useUsers();
  const inbox = useInbox();
  const isAdmin = user?.role === 'admin';
  const shownNews = inbox.news.slice(0, isAdmin ? 3 : 2);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const toast = useToast();
  // Admin: remove a news item for everyone.
  const askDelete = (id: string, title: string) =>
    setConfirm({
      title: 'Nieuwsbericht verwijderen?',
      message: `"${title}" verdwijnt voor iedereen uit de app.`,
      confirmLabel: 'Verwijderen',
      onConfirm: async () => {
        if (await inbox.deleteNews(id)) toast.show('Nieuwsbericht verwijderd');
      },
    });

  const newsSection = (
    <>
      <SectionHead
        title="Nieuws"
        action={isAdmin ? '＋ Schrijven' : inbox.news.length > shownNews.length ? 'Alle nieuws ›' : undefined}
        onAction={() => router.push(isAdmin ? '/admin/nieuws-schrijven' : '/nieuws')}
      />
      {shownNews.length ? (
        shownNews.map((n) => (
          <NewsCard
            key={n.id}
            item={n}
            unread={inbox.isNewsUnread(n)}
            onPress={() => router.push(`/nieuws/${n.id}`)}
            onDelete={isAdmin ? () => askDelete(n.id, n.title) : undefined}
          />
        ))
      ) : (
        <Text style={styles.empty}>Nog geen nieuws.</Text>
      )}
      {isAdmin && inbox.news.length > shownNews.length ? (
        <Text style={styles.more} onPress={() => router.push('/nieuws')}>
          Alle nieuws
        </Text>
      ) : null}
    </>
  );

  if (isAdmin) {
    return (
      <View style={styles.container}>
        <ScreenHeader eyebrow="Docentmodus" title="Berichten" subtitle="Gesprekken met klanten en nieuws" />
        <ScrollView contentContainerStyle={styles.content}>
          <SectionHead first title="Gesprekken" action="＋ Nieuw gesprek" onAction={() => router.push('/admin/nieuw-gesprek')} />
          {inbox.conversations.length ? (
            inbox.conversations.map((c) => {
              const customer = users.find((u) => u.id === c.customerId);
              return (
                <ChatRow
                  key={c.customerId}
                  name={customer?.name ?? 'Klant'}
                  last={`${c.last.fromStudio ? 'Jij: ' : ''}${c.last.body}`}
                  time={msgTime(c.last.at)}
                  unread={c.unread}
                  onPress={() => router.push({ pathname: '/chat', params: { klant: c.customerId } })}
                />
              );
            })
          ) : (
            <Text style={styles.empty}>Nog geen gesprekken.</Text>
          )}
          {newsSection}
        </ScrollView>
        <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
        <Toast message={toast.message} visible={toast.visible} />
      </View>
    );
  }

  const last = user ? inbox.messagesOf(user.id).at(-1) : undefined;
  return (
    <View style={styles.container}>
      <ScreenHeader title="Berichten" subtitle={`Je chat met ${TEACHER_NAME} en het laatste nieuws`} />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHead first title="Chat" />
        {user ? (
          <ChatRow
            photo
            name={TEACHER_NAME}
            last={last ? `${last.fromStudio ? '' : 'Jij: '}${last.body}` : `Stel je vraag aan ${TEACHER_NAME}`}
            time={last ? msgTime(last.at) : undefined}
            unread={inbox.unreadChat}
            onPress={() => router.push('/chat')}
          />
        ) : (
          <ChatRow photo name={TEACHER_NAME} last={`Log in om met ${TEACHER_NAME} te chatten`} unread={0} onPress={() => router.push('/profiel')} />
        )}
        {newsSection}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 32 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, textAlign: 'center', marginVertical: 12 },
  more: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mutedText, textAlign: 'center', textDecorationLine: 'underline', marginTop: 4 },
});
