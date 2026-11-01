import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

const MIN_LENGTH = 8;

// Opened from the reset e-mail (the link signs the person in), or from the
// profile to change the password.
export default function WachtwoordInstellenScreen() {
  const { ready, email, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (password.length < MIN_LENGTH) return setError(`Kies een wachtwoord van minstens ${MIN_LENGTH} tekens.`);
    if (password !== repeat) return setError('De wachtwoorden zijn niet gelijk.');
    setBusy(true);
    const problem = await updatePassword(password);
    setBusy(false);
    if (problem) return setError(problem);
    setError(null);
    setDone(true);
  };

  const toProfile = () => router.replace('/profiel');

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Profiel"
        onBack={toProfile}
        eyebrow="Soulful Yoga"
        title="Nieuw wachtwoord"
        subtitle={email ? `Voor ${email}` : 'Kies een nieuw wachtwoord'}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!ready ? null : done ? (
          <>
            <Text style={styles.done}>✓ Je wachtwoord is opgeslagen</Text>
            <Text style={styles.body}>Je bent ingelogd. Voortaan log je in met je nieuwe wachtwoord.</Text>
            <Pressable style={styles.cta} onPress={toProfile}>
              <Text style={styles.ctaText}>Naar je profiel</Text>
            </Pressable>
          </>
        ) : !email ? (
          <>
            <Text style={styles.body}>
              Deze link is verlopen of al gebruikt. Vraag een nieuwe link aan via "Wachtwoord vergeten" op het inlogscherm.
            </Text>
            <Pressable style={styles.cta} onPress={() => router.replace('/wachtwoord-vergeten')}>
              <Text style={styles.ctaText}>Nieuwe link aanvragen</Text>
            </Pressable>
          </>
        ) : (
          <>
            <TextField label="Nieuw wachtwoord" placeholder={`Minstens ${MIN_LENGTH} tekens`} value={password} onChangeText={setPassword} secureTextEntry />
            <TextField label="Herhaal wachtwoord" placeholder="••••••••" value={repeat} onChangeText={setRepeat} secureTextEntry onSubmitEditing={submit} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
              <Text style={styles.ctaText}>{busy ? 'Bezig…' : 'Wachtwoord opslaan'}</Text>
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
});
