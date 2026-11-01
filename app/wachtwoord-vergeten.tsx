import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Sends a reset link by e-mail; the link opens "Nieuw wachtwoord" (wachtwoord-instellen).
// Also how customers the studio created set their first password.
export default function WachtwoordVergetenScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async () => {
    const normalized = email.trim().toLowerCase();
    if (!isEmail(normalized)) return setError('Vul een geldig e-mailadres in.');
    setBusy(true);
    const problem = await sendPasswordReset(normalized);
    setBusy(false);
    if (problem) return setError(problem);
    setError(null);
    setSentTo(normalized);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Inloggen"
        onBack={() => router.back()}
        eyebrow="Soulful Yoga"
        title="Wachtwoord vergeten"
        subtitle={sentTo ? 'Kijk in je mailbox' : 'We sturen je een link om een nieuw wachtwoord te kiezen'}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {sentTo ? (
          <>
            <Text style={styles.done}>✓ Mail verstuurd</Text>
            <Text style={styles.body}>
              Als er een account is met <Text style={styles.bold}>{sentTo}</Text>, ontvang je een e-mail met een link. Open die link
              op dit apparaat om een nieuw wachtwoord te kiezen. Geen mail? Kijk ook in je spam.
            </Text>
            <Pressable style={styles.cta} onPress={() => router.back()}>
              <Text style={styles.ctaText}>Terug naar inloggen</Text>
            </Pressable>
          </>
        ) : (
          <>
            <TextField label="E-mailadres" placeholder="naam@voorbeeld.nl" value={email} onChangeText={setEmail} keyboardType="email-address" onSubmitEditing={submit} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
              <Text style={styles.ctaText}>{busy ? 'Bezig…' : 'Stuur link'}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingTop: 24 },
  error: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.rani, marginBottom: 14 },
  cta: { backgroundColor: colors.rani, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#fff' },
  done: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.teal, marginBottom: 10 },
  body: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.descText, marginBottom: 20 },
  bold: { fontFamily: fonts.bodySemiBold, color: colors.ink },
});
