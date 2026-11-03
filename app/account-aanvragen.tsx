import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// A guest asks for an account: name, e-mail and phone. The app sends the request to
// Soulful Yoga (stored, push to the admin and a mail to info@soulfulyoga.nl).
export default function AccountAanvragenScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const submit = async () => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!trimmedName) return setError('Vul je naam in.');
    if (!isEmail(normalizedEmail)) return setError('Vul een geldig e-mailadres in.');
    if (phone.replace(/\D/g, '').length < 8) return setError('Vul een geldig telefoonnummer in.');
    setBusy(true);
    const { error: failed } = await supabase.rpc('request_account', { p_name: trimmedName, p_email: normalizedEmail, p_phone: phone.trim() });
    setBusy(false);
    if (failed) return setError(failed.message);
    setError(null);
    setSent(normalizedEmail);
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Inloggen" onBack={() => router.back()} eyebrow="Account aanvragen" title="Aanvraag verstuurd" subtitle="We maken je account zo snel mogelijk aan" />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.done}>✓ Je aanvraag is verstuurd naar Soulful Yoga.</Text>
          <Text style={styles.body}>
            Zodra je account klaarstaat, krijg je een mail op <Text style={styles.bold}>{sent}</Text> om een wachtwoord in te stellen. Daarna kun je inloggen.
          </Text>
          <Pressable style={styles.cta} onPress={() => router.back()}>
            <Text style={styles.ctaText}>Terug naar inloggen</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader backLabel="Inloggen" onBack={() => router.back()} eyebrow="Soulful Yoga" title="Account aanvragen" subtitle="Vul je gegevens in, dan maken wij je account aan" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Naam" placeholder="Voor- en achternaam" value={name} onChangeText={setName} autoCapitalize="words" autoComplete="name" />
        <TextField label="E-mailadres" placeholder="naam@voorbeeld.nl" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
        <TextField
          label="Telefoonnummer"
          placeholder="06 12345678"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          onSubmitEditing={submit}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
          <Text style={styles.ctaText}>{busy ? 'Versturen…' : 'Aanvraag versturen'}</Text>
        </Pressable>
        <Text style={styles.hint}>Je aanvraag gaat direct naar Soulful Yoga.{'\n'}Je krijgt bericht zodra je account klaarstaat.</Text>
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
  hint: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17, color: colors.mutedText, marginTop: 20, textAlign: 'center' },
  done: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.teal, marginBottom: 10 },
  body: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.descText, marginBottom: 20 },
  bold: { fontFamily: fonts.bodySemiBold, color: colors.ink },
});
