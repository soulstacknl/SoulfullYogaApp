import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { NewsCard } from '@/components/BerichtenParts';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';

// All news, newest first.
export default function NieuwsScreen() {
  const inbox = useInbox();
  const { markNewsRead } = inbox;
  // Seen once the list is open; the dots stay visible until the next visit.
  const [unreadIds] = useState(() => inbox.news.filter(inbox.isNewsUnread).map((n) => n.id));
  useEffect(() => {
    markNewsRead();
  }, [markNewsRead]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Berichten"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/berichten'))}
        eyebrow="Soulful Yoga"
        title="Nieuws"
        subtitle={`${inbox.news.length} ${inbox.news.length === 1 ? 'bericht' : 'berichten'}`}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {inbox.news.length ? (
          inbox.news.map((n) => <NewsCard key={n.id} item={n} unread={unreadIds.includes(n.id)} onPress={() => router.push(`/nieuws/${n.id}`)} />)
        ) : (
          <Text style={styles.empty}>Nog geen nieuws.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 32 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, textAlign: 'center', marginTop: 24 },
});
