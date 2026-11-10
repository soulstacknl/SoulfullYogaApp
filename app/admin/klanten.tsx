import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import ScreenHeader from '@/components/ScreenHeader';
import Tag from '@/components/Tag';
import TextField from '@/components/TextField';
import Toast, { useToast } from '@/components/Toast';
import PrivateStripsSection from '@/components/PrivateStripsSection';
import UserStripRow from '@/components/UserStripRow';
import { colors, fonts } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { CARD_SIZE, useUsers } from '@/contexts/UsersContext';
import type { AppUser, CustomerOrigin } from '@/data/users';
import { cardValidity, hasEmail, ORIGIN_LABEL, ORIGIN_TONE, shownEmail } from '@/data/users';
import { currentStandingSession, startTimeOf } from '@/lib/schedule';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// The admin's full customer file: strips (−/+/+10), private-lesson strips, add customers by
// hand or after an account request, and remove customers. Green initials = account request, yellow = by hand.
export default function KlantenScreen() {
  const { students, adjustStrip, activateCard, createCustomer, deleteCustomer, updateCustomer, accountRequests, approveAccountRequest, rejectAccountRequest } = useUsers();
  const { data, today } = useSchedule();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<AppUser | null>(null);
  const [editing, setEditing] = useState(false);
  // Strippenkaart = group lessons; Privélessen = the separate private-lesson cards.
  const [section, setSection] = useState<'groep' | 'prive'>('groep');

  const standingLabel = (email: string) => {
    const session = currentStandingSession(data, email, today);
    return session ? `vast: ${session.day.toLowerCase()} ${startTimeOf(session)}` : undefined;
  };
  const q = query.trim().toLowerCase();
  const list = students.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q));
  const askCard = (u: AppUser) =>
    setConfirm({
      title: 'Nieuwe strippenkaart?',
      message: `${u.name} krijgt een nieuwe ${CARD_SIZE}-strippenkaart: ${u.strippen ?? 0} → ${(u.strippen ?? 0) + CARD_SIZE} strippen.`,
      confirmLabel: 'Activeren',
      onConfirm: () => {
        activateCard(u.email);
        toast.show('Strippenkaart geactiveerd ✓');
      },
    });
  const validityText = (strips: number | null, validUntil: string | null) => {
    const v = strips === null ? null : cardValidity(validUntil, today);
    return !v ? '—' : v.expired ? `vervallen (was t/m ${v.date})` : `geldig t/m ${v.date}`;
  };
  // The sheet shows the latest data (strips change while it is open).
  const openUser = open && students.find((u) => u.email === open.email);

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Klanten"
        subtitle={`${students.length} klanten · strippen, toevoegen en verwijderen`}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.segment}>
          {([['groep', 'Strippenkaart'], ['prive', 'Privélessen']] as const).map(([k, label]) => (
            <Pressable key={k} style={[styles.segmentBtn, section === k && styles.segmentOn]} onPress={() => setSection(k)}>
              <Text style={[styles.segmentText, section === k && styles.segmentTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {section === 'prive' ? (
          <PrivateStripsSection onToast={toast.show} onConfirm={setConfirm} />
        ) : (
          <>
            {adding ? (
              <NewCustomerForm
                onCancel={() => setAdding(false)}
                onCreate={async (name, email, phone, origin) => {
                  if (!(await createCustomer(name, email, phone, origin))) return;
                  setAdding(false);
                  toast.show(origin === 'aanvraag' ? `${name} toegevoegd · mail verstuurd ✓` : `${name} toegevoegd ✓`);
                }}
              />
            ) : (
              <Pressable style={styles.addBtn} onPress={() => setAdding(true)}>
                <Text style={styles.addText}>＋ Klant toevoegen</Text>
              </Pressable>
            )}
            {accountRequests.length ? (
              <View style={styles.requests}>
                <Text style={styles.formTitle}>Accountaanvragen · {accountRequests.length}</Text>
                {accountRequests.map((r) => (
                  <View key={r.id} style={styles.request}>
                    <Text style={styles.requestName}>{r.name}</Text>
                    <Text style={styles.requestDetail}>
                      {r.email} · {r.phone}
                    </Text>
                    <View style={styles.requestBtns}>
                      <Pressable
                        style={[styles.requestBtn, { backgroundColor: colors.teal }]}
                        onPress={async () => {
                          if (await approveAccountRequest(r.id)) toast.show(`${r.name} aangemaakt · mail verstuurd ✓`);
                        }}>
                        <Text style={styles.requestBtnText}>✓ Account aanmaken</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.requestBtn, styles.requestBtnGhost]}
                        onPress={() =>
                          setConfirm({
                            title: 'Aanvraag weigeren?',
                            message: `De aanvraag van ${r.name} wordt verwijderd. Er gaat geen mail naar de klant.`,
                            confirmLabel: 'Weigeren',
                            onConfirm: async () => {
                              if (await rejectAccountRequest(r.id)) toast.show('Aanvraag geweigerd');
                            },
                          })
                        }>
                        <Text style={[styles.requestBtnText, { color: colors.rani }]}>Weigeren</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
            <TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="Zoek op naam of e-mail" placeholderTextColor="#9DAFA2" autoCorrect={false} autoCapitalize="none" />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#CFE7DA' }]} />
                <Text style={styles.legendText}>{ORIGIN_LABEL.aanvraag}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F6DDAF' }]} />
                <Text style={styles.legendText}>{ORIGIN_LABEL.beheer}</Text>
              </View>
            </View>
            {list.map((u) => (
              <UserStripRow
                key={u.email}
                user={u}
                detail={standingLabel(u.email)}
            today={today}
                onOpen={() => {
              setEditing(false);
              setOpen(u);
            }}
                onAdjust={(delta) => adjustStrip(u.email, delta)}
                onActivateCard={() => askCard(u)}
              />
            ))}
            {list.length === 0 ? <Text style={styles.empty}>Geen klant gevonden.</Text> : null}
          </>
        )}
      </ScrollView>

      {/* One customer: details, chat and remove. */}
      <Modal visible={!!openUser} transparent animationType="slide" onRequestClose={() => setOpen(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)}>
          {openUser && editing ? (
            <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]} onPress={(e) => e.stopPropagation()}>
              <EditCustomerForm
                user={openUser}
                onCancel={() => setEditing(false)}
                onSave={async (fields) => {
                  if (!(await updateCustomer(openUser.email, fields))) return;
                  setEditing(false);
                  // The sheet follows the customer by e-mail, which may just have changed.
                  setOpen({ ...openUser, email: fields.email.trim().toLowerCase() || openUser.email });
                  toast.show('Gegevens opgeslagen ✓');
                }}
              />
            </Pressable>
          ) : openUser ? (
            <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.sheetName}>{openUser.name}</Text>
              <Tag label={ORIGIN_LABEL[openUser.origin]} tone={ORIGIN_TONE[openUser.origin]} />
              <View style={styles.facts}>
                <Fact label="E-mailadres" value={shownEmail(openUser.email)} />
                <Fact label="Telefoon" value={openUser.phone || '—'} />
                <Fact label="Strippen" value={openUser.strippen === null ? 'geen kaart' : String(openUser.strippen)} />
                <Fact label="Strippenkaart" value={validityText(openUser.strippen, openUser.stripsValidUntil)} />
                <Fact label="Privéstrippen" value={openUser.privateStrips === null ? 'geen kaart' : String(openUser.privateStrips)} />
                <Fact label="Groepsles" value={standingLabel(openUser.email)?.replace('vast: ', '') ?? '—'} />
                <Fact label="Voorwaarden" value={openUser.termsAcceptedAt ? `akkoord ${openUser.termsAcceptedAt}` : 'nog niet akkoord'} />
              </View>
              <Pressable style={styles.sheetBtn} onPress={() => setEditing(true)}>
                <Text style={styles.sheetBtnText}>✏️ Gegevens aanpassen</Text>
              </Pressable>
              {hasEmail(openUser.email) && openUser.origin === 'aanvraag' ? (
                <Pressable
                  style={styles.sheetBtn}
                  onPress={() => {
                    setOpen(null);
                    router.push({ pathname: '/chat', params: { klant: openUser.id } });
                  }}>
                  <Text style={styles.sheetBtnText}>💬 Chat met {openUser.name.split(' ')[0]}</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[styles.sheetBtn, styles.deleteBtn]}
                onPress={() =>
                  setConfirm({
                    title: `${openUser.name} verwijderen?`,
                    message: 'De klant, de strippenkaart, lessen en chatberichten worden definitief verwijderd. Dit kan niet ongedaan worden gemaakt.',
                    confirmLabel: 'Verwijderen',
                    onConfirm: async () => {
                      setOpen(null);
                      if (await deleteCustomer(openUser.email)) toast.show(`${openUser.name} verwijderd`);
                    },
                  })
                }>
                <Text style={[styles.sheetBtnText, { color: colors.rani }]}>Klant verwijderen</Text>
              </Pressable>
            </Pressable>
          ) : null}
        </Pressable>
        {confirm ? <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} /> : null}
      </Modal>
      {!openUser && confirm ? <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} /> : null}
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

// Name, e-mail and phone of an existing customer. A changed e-mail is also their login.
function EditCustomerForm({ user, onCancel, onSave }: { user: AppUser; onCancel: () => void; onSave: (fields: { name: string; phone: string; email: string }) => Promise<void> }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(hasEmail(user.email) ? user.email : '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const save = () => {
    if (!name.trim()) return setError('Vul een naam in.');
    if (email.trim() && !isEmail(email.trim())) return setError('Dit e-mailadres klopt niet.');
    if (!email.trim() && hasEmail(user.email)) return setError('Vul een e-mailadres in.');
    setError(null);
    onSave({ name: name.trim(), phone: phone.trim(), email: email.trim() });
  };
  return (
    <View>
      <Text style={styles.formTitle}>Gegevens aanpassen</Text>
      <TextField label="Naam" value={name} onChangeText={setName} autoCapitalize="words" />
      <TextField label={hasEmail(user.email) ? 'E-mailadres' : 'E-mailadres (optioneel)'} placeholder="naam@voorbeeld.nl" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextField label="Telefoon" placeholder="06 12345678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {hasEmail(user.email) && email.trim().toLowerCase() !== user.email ? (
        <Text style={styles.formHint}>Let op: de klant logt daarna in met het nieuwe e-mailadres. Het wachtwoord blijft hetzelfde.</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.sheetBtn} onPress={save}>
        <Text style={styles.sheetBtnText}>Opslaan</Text>
      </Pressable>
      <Pressable onPress={onCancel} style={{ alignItems: 'center', paddingTop: 4 }}>
        <Text style={styles.cancelText}>Annuleren</Text>
      </Pressable>
    </View>
  );
}

// Add a customer: after an account request (gets a mail to set a password), or by
// hand for someone who doesn't use the app (e-mail optional).
function NewCustomerForm({ onCancel, onCreate }: { onCancel: () => void; onCreate: (name: string, email: string, phone: string, origin: CustomerOrigin) => Promise<void> }) {
  const [origin, setOrigin] = useState<CustomerOrigin>('beheer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const mail = email.trim().toLowerCase();
    if (!name.trim()) return setError('Vul een naam in.');
    if ((origin === 'aanvraag' || mail) && !isEmail(mail)) return setError('Vul een geldig e-mailadres in.');
    setError(null);
    setBusy(true);
    await onCreate(name.trim(), mail, phone.trim(), origin);
    setBusy(false);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Klant toevoegen</Text>
      <View style={styles.segment}>
        {(['beheer', 'aanvraag'] as const).map((o) => (
          <Pressable key={o} style={[styles.segmentBtn, origin === o && styles.segmentOn]} onPress={() => setOrigin(o)}>
            <Text style={[styles.segmentText, origin === o && { color: colors.ink }]}>{ORIGIN_LABEL[o]}</Text>
          </Pressable>
        ))}
      </View>
      <TextField label="Naam" placeholder="Voor- en achternaam" value={name} onChangeText={setName} autoCapitalize="words" />
      <TextField
        label={origin === 'aanvraag' ? 'E-mailadres' : 'E-mailadres (optioneel)'}
        placeholder="naam@voorbeeld.nl"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextField label="Telefoon (optioneel)" placeholder="06 12345678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={styles.formHint}>
        {origin === 'aanvraag'
          ? 'De klant krijgt een mail om een wachtwoord in te stellen en kan daarna inloggen in de app.'
          : 'Voor een klant zonder de app: je houdt strippen en lessen zelf bij. Er gaat geen mail naar de klant.'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.addBtn, busy && { opacity: 0.6 }]} onPress={save} disabled={busy}>
        <Text style={styles.addText}>Toevoegen</Text>
      </Pressable>
      <Pressable style={{ alignItems: 'center', paddingVertical: 6 }} onPress={onCancel}>
        <Text style={styles.cancelText}>Annuleren</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingTop: 14, paddingBottom: 32 },
  addBtn: { backgroundColor: colors.rani, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  addText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#fff' },
  search: { fontFamily: fonts.body, fontSize: 14.5, color: colors.ink, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, marginBottom: 10 },
  requests: { backgroundColor: '#FCF1DE', borderWidth: 1, borderColor: '#EFC97A', borderRadius: 18, padding: 14, marginBottom: 14 },
  request: { backgroundColor: colors.card, borderRadius: 14, padding: 12, marginTop: 8 },
  requestName: { fontFamily: fonts.bodySemiBold, fontSize: 14.5, color: colors.ink },
  requestDetail: { fontFamily: fonts.body, fontSize: 12.5, color: colors.mutedText, marginTop: 2 },
  requestBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  requestBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  requestBtnGhost: { borderWidth: 1.5, borderColor: colors.rani },
  requestBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#fff' },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 10, paddingHorizontal: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedText },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, textAlign: 'center', marginTop: 20 },
  form: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderRadius: 18, padding: 16, marginBottom: 14 },
  formTitle: { fontFamily: fonts.displayItalic, fontSize: 15, color: colors.rani, marginBottom: 10 },
  formHint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.mutedText, marginBottom: 12 },
  segment: { flexDirection: 'row', backgroundColor: '#EFE6D6', borderRadius: 12, padding: 3, marginBottom: 14 },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
  segmentOn: { backgroundColor: colors.card },
  segmentText: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.mutedText },
  segmentTextOn: { color: colors.ink },
  error: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.rani, marginBottom: 10 },
  cancelText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.mutedText, textDecorationLine: 'underline' },
  backdrop: { flex: 1, backgroundColor: 'rgba(18,38,26,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.ivory, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, paddingTop: 22 },
  sheetName: { fontFamily: fonts.display, fontSize: 21, color: colors.ink },
  facts: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginTop: 14, marginBottom: 14 },
  fact: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 7 },
  factLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.mutedText },
  factValue: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  sheetBtn: { borderWidth: 1.5, borderColor: colors.ink, borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginBottom: 10 },
  deleteBtn: { borderColor: colors.rani },
  sheetBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});
