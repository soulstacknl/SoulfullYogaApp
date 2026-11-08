import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type Props = {
  visible: boolean;
  customerName: string;
  onClose: () => void;
  onSend: (description: string, amountCents: number, payUrl: string) => Promise<boolean>;
};

// "110" / "110,50" / "110.50" → cents; null when it isn't a positive amount.
const toCents = (text: string) => {
  const clean = text.trim().replace(/^€\s*/, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const cents = Math.round(Number(clean) * 100);
  return cents > 0 ? cents : null;
};

// The admin fills in the amount, what it is for and a payment link from the bank or Tikkie.
export default function PaymentRequestSheet({ visible, customerName, onClose, onSend }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const close = () => {
    setAmount('');
    setDescription('');
    setUrl('');
    setError(null);
    onClose();
  };

  const send = async () => {
    const cents = toCents(amount);
    const link = url.trim();
    if (cents === null) return setError('Vul een bedrag in, bijvoorbeeld 110 of 15,50.');
    if (!description.trim()) return setError('Vul in waarvoor het betaalverzoek is.');
    if (!/^https:\/\/\S+$/.test(link)) return setError('Plak de betaallink van je bank of Tikkie (begint met https://).');
    setSending(true);
    const ok = await onSend(description.trim(), cents, link);
    setSending(false);
    if (ok) close();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Betaalverzoek</Text>
            <Text style={styles.subtitle}>Aan {customerName}</Text>

            <Text style={styles.label}>Bedrag</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="€ 110,00"
              placeholderTextColor="#9DAFA2"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Waarvoor</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Bijvoorbeeld: 10-strippenkaart"
              placeholderTextColor="#9DAFA2"
              maxLength={200}
            />
            <Text style={styles.label}>Betaallink</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://… (van je bank of Tikkie)"
              placeholderTextColor="#9DAFA2"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Text style={styles.hint}>
              Maak in je bank-app of Tikkie een betaalverzoek aan en kopieer de link. {customerName.split(' ')[0]} ziet
              in de chat een knop Betalen. Is er betaald? Tik dan in de chat op Markeer als betaald.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={[styles.sendBtn, sending && styles.sendBtnOff]} onPress={send} disabled={sending}>
              <Text style={styles.sendBtnText}>{sending ? 'Versturen…' : 'Versturen'}</Text>
            </Pressable>
            <Pressable style={styles.cancel} onPress={close}>
              <Text style={styles.cancelText}>Annuleren</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(18,38,26,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.ivory,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 30,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 21, color: colors.ink },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.mutedText, marginBottom: 14 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.ink, marginBottom: 5, marginTop: 6 },
  input: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.mutedText, marginTop: 10 },
  error: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.rani, marginTop: 10 },
  sendBtn: { backgroundColor: colors.rani, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  sendBtnOff: { opacity: 0.6 },
  sendBtnText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#fff' },
  cancel: { alignItems: 'center', paddingTop: 12 },
  cancelText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mutedText },
});
