import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';
import { useCurrentUser } from '@/contexts/UsersContext';
import { dateLabel, isoOf } from '@/lib/dutchDate';

// One news item in full. The admin can delete it here.
export default function NieuwsItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const inbox = useInbox();
  const isAdmin = useCurrentUser()?.role === 'admin';
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const item = inbox.news.find((n) => n.id === id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/berichten'));

  const { markNewsRead } = inbox;
  useEffect(() => {
    if (item) markNewsRead();
  }, [item, markNewsRead]);

  if (!item) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Terug" onBack={back} eyebrow="Nieuws" title="Nieuws" subtitle="" />
        <Text style={styles.empty}>Dit bericht bestaat niet meer.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader backLabel="Terug" onBack={back} eyebrow="Nieuws" title={item.title} subtitle="" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>
          {dateLabel(isoOf(new Date(item.at)))}
          {isAdmin && item.push ? ' · pushmelding verstuurd' : ''}
        </Text>
        <Text style={styles.body}>{item.body}</Text>
        {isAdmin ? (
          <Text
            style={styles.delete}
            onPress={() =>
              setConfirm({
                title: 'Nieuwsbericht verwijderen?',
                message: 'Het bericht verdwijnt voor iedereen uit de app.',
                confirmLabel: 'Verwijderen',
                onConfirm: async () => {
                  if (await inbox.deleteNews(item.id)) back();
                },
              })
            }>
            Bericht verwijderen
          </Text>
        ) : null}
      </ScrollView>
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32 },
  date: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText, marginBottom: 10 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.descText },
  delete: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.rani, textAlign: 'center', marginTop: 28, textDecorationLine: 'underline' },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, textAlign: 'center', marginTop: 24 },
});
