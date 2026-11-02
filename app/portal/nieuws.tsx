import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { usePortal } from '@/components/portal/PortalContext';
import { Btn, Card, Empty, ErrorText, Field, Input, PageHeader, Pill, portalStyles } from '@/components/portal/ui';
import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';
import { useUsers } from '@/contexts/UsersContext';
import { dateLabel, isoOf } from '@/lib/dutchDate';

type Form = { id: string | null; title: string; body: string; push: boolean };
const emptyForm: Form = { id: null, title: '', body: '', push: true };

// News for every customer: write (optionally with a push notification), edit, delete.
export default function PortalNieuws() {
  const inbox = useInbox();
  const { students } = useUsers();
  const portal = usePortal();
  const [form, setForm] = useState<Form>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const set = (fields: Partial<Form>) => setForm((f) => ({ ...f, ...fields }));

  const save = async () => {
    const title = form.title.trim(), body = form.body.trim();
    if (!title || !body) return setError('Vul een titel en een bericht in.');
    setError(null);
    const ok = form.id ? await inbox.updateNews(form.id, title, body) : await inbox.postNews(title, body, form.push);
    if (!ok) return;
    portal.toast(form.id ? 'Opgeslagen ✓' : form.push ? 'Gepubliceerd en verstuurd ✓' : 'Gepubliceerd ✓');
    setForm(emptyForm);
  };

  return (
    <View>
      <PageHeader title="Nieuws" subtitle="Berichten die iedereen in de app kan lezen, onder Berichten." />
      <View style={portalStyles.grid2}>
        <View style={portalStyles.col}>
          <Card title={form.id ? 'Bericht aanpassen' : 'Nieuw bericht'}>
            <View style={{ gap: 12 }}>
              <Field label="Titel" style={styles.field}>
                <Input value={form.title} onChange={(title) => set({ title })} placeholder="Bijvoorbeeld: Zomerrooster" />
              </Field>
              <Field label="Bericht" style={styles.field}>
                <TextInput
                  value={form.body}
                  onChangeText={(body) => set({ body })}
                  placeholder="Wat wil je je klanten laten weten?"
                  placeholderTextColor="#9DAFA2"
                  multiline
                  style={styles.textarea}
                />
              </Field>
              {!form.id ? (
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink }}>
                  <input type="checkbox" checked={form.push} onChange={(e) => set({ push: e.target.checked })} />
                  Pushmelding sturen naar alle klanten ({students.length})
                </label>
              ) : null}
              <ErrorText text={error} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Btn label={form.id ? 'Opslaan' : 'Publiceren'} tone="primary" onPress={save} />
                {form.id ? <Btn label="Annuleren" onPress={() => setForm(emptyForm)} /> : null}
              </View>
            </View>
          </Card>
        </View>
        <View style={portalStyles.col}>
          <Card title="Gepubliceerd" note={`${inbox.news.length} ${inbox.news.length === 1 ? 'bericht' : 'berichten'}`}>
            {inbox.news.length ? (
              inbox.news.map((n, i) => (
                <View key={n.id} style={[styles.item, i === 0 && { borderTopWidth: 0, paddingTop: 2 }]}>
                  <Text style={styles.title}>{n.title}</Text>
                  <Text style={styles.body}>{n.body}</Text>
                  <View style={styles.meta}>
                    <Text style={styles.date}>{dateLabel(isoOf(new Date(n.at)))}</Text>
                    <Pill label={n.push ? 'pushmelding verstuurd' : 'zonder pushmelding'} tone={n.push ? 'teal' : 'muted'} />
                    <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 6 }}>
                      <Btn label="Aanpassen" small onPress={() => setForm({ id: n.id, title: n.title, body: n.body, push: n.push })} />
                      <Btn
                        label="Verwijderen"
                        small
                        tone="ghost"
                        onPress={() =>
                          portal.confirm({
                            title: 'Nieuwsbericht verwijderen?',
                            message: 'Het bericht verdwijnt voor iedereen uit de app.',
                            confirmLabel: 'Verwijderen',
                            onConfirm: async () => {
                              if (await inbox.deleteNews(n.id)) portal.toast('Verwijderd');
                              if (form.id === n.id) setForm(emptyForm);
                            },
                          })
                        }
                      />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Empty text="Nog geen nieuws." />
            )}
          </Card>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Field grows in a row by default; here the fields are stacked.
  field: { flexBasis: 'auto', flexGrow: 0 },
  textarea: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 11,
    backgroundColor: '#fff',
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
  },
  item: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1EADC' },
  title: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.descText, marginTop: 4, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  date: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedText },
});
