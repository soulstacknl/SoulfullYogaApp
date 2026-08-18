import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/constants/theme';
import { useUsers } from '@/contexts/UsersContext';

type LoginScreenProps = {
  onLogin: (email: string) => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { findUser } = useUsers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Vul je e-mailadres en wachtwoord in.');
      return;
    }

    const match = findUser(normalizedEmail, password);

    if (!match) {
      setError('Onjuist e-mailadres of wachtwoord.');
      return;
    }

    setError(null);
    onLogin(match.email);
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
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.loginBtn} onPress={handleSubmit}>
          <Text style={styles.loginBtnText}>Inloggen</Text>
        </Pressable>

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
  hint: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.mutedText,
    marginTop: 20,
    lineHeight: 17,
    textAlign: 'center',
  },
});
