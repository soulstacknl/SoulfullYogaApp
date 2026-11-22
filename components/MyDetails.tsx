import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/Avatar';
import TextField from '@/components/TextField';
import { colors, fonts } from '@/constants/theme';
import { useUsers } from '@/contexts/UsersContext';
import type { AppUser } from '@/data/users';
import { shownEmail } from '@/data/users';
import { MAX_AVATAR_BYTES } from '@/lib/avatar';

const warn = (message: string) => (Platform.OS === 'web' ? window.alert(message) : Alert.alert('Foto', message));

// The customer's own photo (tap to change) and details: phone and address are optional.
export default function MyDetails({ user, onSaved }: { user: AppUser; onSaved: (message: string) => void }) {
  const { setMyAvatar, updateMyDetails } = useUsers();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', postcode: '', city: '' });

  // The system picker (no extra permissions), images only.
  const pickPhoto = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const a = result.assets[0];
    const size = a.size ?? a.file?.size ?? 0;
    if (size > MAX_AVATAR_BYTES) return warn('Deze foto is te groot. Kies een foto tot 10 MB.');
    setBusy(true);
    const ok = await setMyAvatar({ name: a.name, type: a.mimeType ?? a.file?.type ?? 'image/jpeg', size, uri: a.uri, file: a.file });
    setBusy(false);
    if (ok) onSaved('Foto opgeslagen ✓');
  };

  const startEdit = () => {
    setForm({ phone: user.phone ?? '', address: user.address ?? '', postcode: user.postcode ?? '', city: user.city ?? '' });
    setEditing(true);
  };

  const addressLine = [user.address, [user.postcode, user.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');

  return (
    <View style={styles.hero}>
      <Pressable onPress={pickPhoto} disabled={busy} style={styles.photoWrap} accessibilityLabel="Profielfoto aanpassen">
        <Avatar path={user.avatarPath} name={user.name} size={84} />
        <View style={styles.camera}>
          <Text style={styles.cameraText}>{busy ? '…' : '📷'}</Text>
        </View>
      </Pressable>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{shownEmail(user.email)}</Text>

      {editing ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mijn gegevens</Text>
          <TextField label="Telefoonnummer (optioneel)" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" placeholder="06 12345678" />
          <TextField label="Adres (optioneel)" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} autoCapitalize="words" placeholder="Straat en huisnummer" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField label="Postcode" value={form.postcode} onChangeText={(v) => setForm({ ...form, postcode: v })} autoCapitalize="characters" placeholder="1234 AB" />
            </View>
            <View style={{ flex: 1.4 }}>
              <TextField label="Plaats" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} autoCapitalize="words" placeholder="Berghem" />
            </View>
          </View>
          <Pressable
            style={styles.saveBtn}
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              const ok = await updateMyDetails({
                phone: form.phone.trim(),
                address: form.address.trim(),
                postcode: form.postcode.trim().toUpperCase(),
                city: form.city.trim(),
              });
              setBusy(false);
              if (!ok) return;
              setEditing(false);
              onSaved('Gegevens opgeslagen ✓');
            }}>
            <Text style={styles.saveText}>Opslaan</Text>
          </Pressable>
          <Pressable onPress={() => setEditing(false)} style={{ alignItems: 'center', paddingTop: 10 }}>
            <Text style={styles.cancelText}>Annuleren</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.card} onPress={startEdit}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Mijn gegevens</Text>
            <Text style={styles.editLink}>Aanpassen ›</Text>
          </View>
          <Text style={styles.detail}>📞 {user.phone || 'Geen telefoonnummer'}</Text>
          <Text style={styles.detail}>🏠 {addressLine || 'Geen adres (optioneel)'}</Text>
          {!user.avatarPath ? <Text style={styles.hint}>Tik op de foto om een profielfoto toe te voegen.</Text> : null}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 4 },
  photoWrap: { marginBottom: 10 },
  camera: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: { fontSize: 14 },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginBottom: 2 },
  email: { fontFamily: fonts.body, fontSize: 13, color: colors.mutedText },
  card: {
    alignSelf: 'stretch',
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 16,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontFamily: fonts.displayItalic, fontSize: 15, color: colors.rani, marginBottom: 8 },
  editLink: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.teal, marginBottom: 8 },
  detail: { fontFamily: fonts.body, fontSize: 13.5, color: colors.descText, marginTop: 2 },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedText, marginTop: 8 },
  row: { flexDirection: 'row', gap: 10 },
  saveBtn: { backgroundColor: colors.rani, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  saveText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#fff' },
  cancelText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mutedText },
});
