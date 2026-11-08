import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import CardValidity from '@/components/CardValidity';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import Stepper from '@/components/Stepper';
import { colors, fonts } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { CARD_SIZE, useUsers } from '@/contexts/UsersContext';
import type { AppUser } from '@/data/users';

type Props = {
  onToast: (message: string) => void;
  onConfirm: (request: ConfirmRequest) => void;
};

// Klanten beheren → Privélessen: a separate strip card per customer for private lessons.
// The admin creates it and takes a strip off by hand (−) after a private lesson; the
// attendance list never touches these strips.
export default function PrivateStripsSection({ onToast, onConfirm }: Props) {
  const { students, adjustPrivateStrips, removePrivateCard } = useUsers();
  const { today } = useSchedule();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [chosen, setChosen] = useState<AppUser | null>(null);
  const [amount, setAmount] = useState(CARD_SIZE);

  const withCard = students.filter((u) => u.privateStrips !== null);
  const q = search.trim().toLowerCase();
  const pickable = students.filter(
    (u) => u.privateStrips === null && (!q || u.name.toLowerCase().includes(q) || u.email.includes(q))
  );

  const stopCreating = () => {
    setCreating(false);
    setChosen(null);
    setSearch('');
    setAmount(CARD_SIZE);
  };

  const create = () => {
    if (!chosen) return;
    adjustPrivateStrips(chosen.email, amount);
    onToast(`Privé-strippenkaart voor ${chosen.name.split(' ')[0]} · ${amount} strippen ✓`);
    stopCreating();
  };

  const adjust = (u: AppUser, delta: number) => {
    const left = Math.max(0, (u.privateStrips ?? 0) + delta);
    if (delta < 0 && !u.privateStrips) return onToast(`${u.name.split(' ')[0]} heeft geen privéstrippen meer`);
    adjustPrivateStrips(u.email, delta);
    if (delta < 0) onToast(`Privéles afgeschreven · nog ${left} ${left === 1 ? 'strip' : 'strippen'}`);
  };

  return (
    <View>
      <Text style={styles.note}>
        Een aparte strippenkaart voor privélessen, 4 maanden geldig. Heeft een klant een privéles gehad? Tik dan
        hier op −. Met + begint de geldigheid opnieuw. De presentielijst schrijft deze strippen niet af.
      </Text>

      {creating ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Privé-strippenkaart aanmaken</Text>
          {chosen ? (
            <>
              <View style={styles.chosen}>
                <View style={styles.info}>
                  <Text style={styles.name}>{chosen.name}</Text>
                  <Text style={styles.detail}>{chosen.email}</Text>
                </View>
                <Pressable onPress={() => setChosen(null)} hitSlop={8}>
                  <Text style={styles.link}>Wijzig</Text>
                </Pressable>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Aantal strippen</Text>
                <Stepper value={amount} onChange={(d) => setAmount((a) => Math.max(1, a + d))} />
              </View>
              <Pressable style={styles.primaryBtn} onPress={create}>
                <Text style={styles.primaryBtnText}>Kaart aanmaken</Text>
              </Pressable>
            </>
          ) : (
            <>
              <TextInput
                style={styles.search}
                value={search}
                onChangeText={setSearch}
                placeholder="Kies een klant: zoek op naam"
                placeholderTextColor="#9DAFA2"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {pickable.slice(0, 30).map((u) => (
                <Pressable key={u.email} style={styles.pickRow} onPress={() => setChosen(u)}>
                  <View style={styles.info}>
                    <Text style={styles.name}>{u.name}</Text>
                    <Text style={styles.detail}>{u.email}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}
              {pickable.length === 0 ? <Text style={styles.empty}>Geen klant gevonden.</Text> : null}
            </>
          )}
          <Pressable onPress={stopCreating} style={styles.cancel}>
            <Text style={styles.cancelText}>Annuleren</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.addBtn} onPress={() => setCreating(true)}>
          <Text style={styles.addText}>＋ Privé-strippenkaart aanmaken</Text>
        </Pressable>
      )}

      {withCard.map((u) => (
        <View key={u.email} style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name}>{u.name}</Text>
            <Text style={[styles.count, u.privateStrips === 0 && styles.countEmpty]}>
              {u.privateStrips} {u.privateStrips === 1 ? 'privéstrip' : 'privéstrippen'}
            </Text>
            <CardValidity validUntil={u.privateValidUntil} today={today} />
            <Pressable
              hitSlop={6}
              onPress={() =>
                onConfirm({
                  title: 'Privé-strippenkaart verwijderen?',
                  message: `${u.name} heeft nog ${u.privateStrips} ${u.privateStrips === 1 ? 'privéstrip' : 'privéstrippen'}. De kaart verdwijnt uit deze lijst.`,
                  confirmLabel: 'Verwijderen',
                  onConfirm: () => removePrivateCard(u.email),
                })
              }>
              <Text style={styles.removeText}>Kaart verwijderen</Text>
            </Pressable>
          </View>
          <Stepper value={u.privateStrips ?? 0} onChange={(d) => adjust(u, d)} size="md" />
        </View>
      ))}
      {withCard.length === 0 && !creating ? <Text style={styles.empty}>Nog geen privé-strippenkaarten.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.mutedText,
    marginBottom: 12,
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 14,
  },
  addText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  form: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  formTitle: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
    marginBottom: 10,
  },
  search: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  chosen: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  amountLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  primaryBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#fff',
  },
  cancel: {
    alignItems: 'center',
    paddingTop: 12,
  },
  cancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.mutedText,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 14,
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  detail: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.mutedText,
  },
  count: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.teal,
    marginTop: 2,
  },
  countEmpty: {
    color: colors.rani,
  },
  link: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.rani,
  },
  removeText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: '#9DAFA2',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  chevron: {
    fontSize: 22,
    color: colors.sand,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 18,
  },
});
