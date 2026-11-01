import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

// Signs in with Supabase; the profile tab switches over once the session is there.
export default function LoginScreen() {
  const { login } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Vul je e-mailadres en wachtwoord in.');
      return;
    }

    setBusy(true);
    const problem = await login(normalizedEmail, password);
    setBusy(false);
    setError(problem);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Inloggen" subtitle="Log in om je strippenkaart te bekijken" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">
        <TextField
          label="E-mailadres"
          placeholder="naam@voorbeeld.nl"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextField
          label="Wachtwoord"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={handleSubmit}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.loginBtn, busy && { opacity: 0.6 }]} onPress={handleSubmit} disabled={busy}>
          <Text style={styles.loginBtnText}>{busy ? 'Bezig met inloggen…' : 'Inloggen'}</Text>
        </Pressable>

        <Text style={styles.forgot} onPress={() => router.push({ pathname: '/wachtwoord-vergeten', params: { email: email.trim() } })}>
          Wachtwoord vergeten?
        </Text>

        <Text style={styles.askAccount}>
          Nog geen account?{' '}
          <Text style={styles.askAccountLink} onPress={() => router.push('/account-aanvragen')}>
            Account aanvragen
          </Text>
        </Text>

        <Text style={styles.hint}>
          Demo-account: marieke@soulfulyoga.nl · yoga123{'\n'}
          (of daan@soulfulyoga.nl · yoga123 voor een account zonder strippenkaart)
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: colors.rani,
    marginBottom: 14,
  },
  loginBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
  forgot: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 14,
  },
  askAccount: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.descText,
    textAlign: 'center',
    marginTop: 16,
  },
  askAccountLink: {
    fontFamily: fonts.bodySemiBold,
    color: colors.rani,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.mutedText,
    marginTop: 20,
    lineHeight: 17,
    textAlign: 'center',
  },
});
