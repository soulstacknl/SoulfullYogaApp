import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';

// The admin writes a news item; with "push" every customer gets a notification.
export default function NieuwsSchrijvenScreen() {
  const inbox = useInbox();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [push, setPush] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    if (!title.trim() || !body.trim()) return setError('Vul een titel en een bericht in.');
    setBusy(true);
    const ok = await inbox.postNews(title.trim(), body.trim(), push);
    setBusy(false);
    if (ok) router.back();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader backLabel="Berichten" onBack={() => router.back()} eyebrow="Docentmodus" title="Nieuwsbericht" subtitle="Iedereen met de app kan het lezen" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Titel" placeholder="Bijvoorbeeld: Zomerrooster" value={title} onChangeText={setTitle} autoCapitalize="sentences" autoCorrect maxLength={120} />
        <TextField
          label="Bericht"
          placeholder="Wat wil je je klanten laten weten?"
          value={body}
          onChangeText={setBody}
          autoCapitalize="sentences"
          autoCorrect
          multiline
          style={styles.body}
          textAlignVertical="top"
        />
        <View style={styles.toggle}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Pushbericht sturen</Text>
            <Text style={styles.toggleSub}>Iedereen krijgt een melding op de telefoon</Text>
          </View>
          <Switch value={push} onValueChange={setPush} trackColor={{ false: colors.sand, true: colors.teal }} thumbColor="#fff" />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} onPress={publish} disabled={busy}>
          <Text style={styles.ctaText}>Publiceren</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingTop: 24 },
  body: { minHeight: 150, paddingTop: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderRadius: 16, padding: 14, marginBottom: 16 },
  toggleTitle: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.ink },
  toggleSub: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedText, marginTop: 2 },
  error: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.rani, marginBottom: 14 },
  cta: { backgroundColor: colors.rani, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#fff' },
});
