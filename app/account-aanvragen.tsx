import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/constants/theme';
import { useUsers } from '@/contexts/UsersContext';

const STUDIO_MAIL = 'info@soulfulyoga.nl';
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// The e-mail the studio receives for an account request.
const accountMail = (name: string, email: string) => ({
  subject: `Accountaanvraag: ${name}`,
  body: `Nieuwe accountaanvraag via de Soulful Yoga app.\n\nNaam: ${name}\nE-mailadres: ${email}\n\nMaak een account aan en laat de klant weten dat het klaarstaat.`,
});

// A guest asks for an account: name + e-mail. Until there's a backend the
// request goes out through the guest's own mail app, already filled in.
export default function AccountAanvragenScreen() {
  const { users } = useUsers();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState<{ name: string; email: string } | null>(null);

  const mailUrl = (n: string, e: string) => {
    const mail = accountMail(n, e);
    return `mailto:${STUDIO_MAIL}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;
  };

  const submit = async () => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!trimmedName) return setError('Vul je naam in.');
    if (!isEmail(normalizedEmail)) return setError('Vul een geldig e-mailadres in.');
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return setError('Er bestaat al een account met dit e-mailadres. Log in met je wachtwoord.');
    }
    try {
      await Linking.openURL(mailUrl(trimmedName, normalizedEmail));
      setError(null);
      setOpened({ name: trimmedName, email: normalizedEmail });
    } catch {
      setError(`Je mailprogramma kon niet worden geopend. Mail je naam en e-mailadres naar ${STUDIO_MAIL}.`);
    }
  };

  if (opened) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Inloggen" onBack={() => router.back()} eyebrow="Account aanvragen" title="Bijna klaar" subtitle="Verstuur de e-mail in je mailprogramma" />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.done}>✓ Je aanvraag staat klaar in je mailprogramma.</Text>
          <Text style={styles.body}>
            Druk daar op Verzenden om de aanvraag naar Soulful Yoga te sturen. Zodra je account klaarstaat, krijg je bericht op{' '}
            <Text style={styles.bold}>{opened.email}</Text>.
          </Text>
          <Pressable style={styles.cta} onPress={() => router.back()}>
            <Text style={styles.ctaText}>Terug naar inloggen</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => Linking.openURL(mailUrl(opened.name, opened.email))}>
            <Text style={styles.secondaryText}>Mailprogramma opnieuw openen</Text>
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
        <TextField label="E-mailadres" placeholder="naam@voorbeeld.nl" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" onSubmitEditing={submit} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.cta} onPress={submit}>
          <Text style={styles.ctaText}>Aanvraag versturen</Text>
        </Pressable>
        <Text style={styles.hint}>
          Je mailprogramma opent met de aanvraag aan {STUDIO_MAIL}.{'\n'}Je krijgt bericht zodra je account klaarstaat.
        </Text>
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
  secondary: { alignItems: 'center', paddingVertical: 14 },
  secondaryText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mutedText },
  hint: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17, color: colors.mutedText, marginTop: 20, textAlign: 'center' },
  done: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.teal, marginBottom: 10 },
  body: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.descText, marginBottom: 20 },
  bold: { fontFamily: fonts.bodySemiBold, color: colors.ink },
});
