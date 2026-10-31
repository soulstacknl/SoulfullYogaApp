import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import ScreenHeader from '@/components/ScreenHeader';
import Tag from '@/components/Tag';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { Session } from '@/data/schedule';
import { dateLabel, shortDate, WEEKDAYS } from '@/lib/dutchDate';
import { isExtra, startTimeOf } from '@/lib/schedule';

// Weekly schedule plus exceptions (extra lessons and holidays).
export default function RoosterBeherenScreen() {
  const { data, today, removeClosure, removeExtraSession } = useSchedule();
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const weekOrder = (s: Session) => (WEEKDAYS.indexOf(s.day) + 6) % 7; // Monday first
  const weekly = data.sessions
    .filter((s) => !isExtra(s) && (!s.until || s.until >= today) && !(s.from && s.until && s.until < s.from))
    .sort((a, b) => weekOrder(a) - weekOrder(b) || a.time.localeCompare(b.time));
  const extras = data.sessions.filter((s) => isExtra(s) && s.from! >= today).sort((a, b) => a.from!.localeCompare(b.from!));
  const closures = data.closures.filter((c) => c.to >= today).sort((a, b) => a.from.localeCompare(b.from));

  const period = (s: Session) =>
    [s.from && s.from > today ? `vanaf ${shortDate(s.from)}` : '', s.until ? `t/m ${shortDate(s.until)}` : '']
      .filter(Boolean)
      .join(' · ');

  const sessionLabel = (sessionId: string) => {
    const s = data.sessions.find((x) => x.id === sessionId);
    return s ? `${s.day.toLowerCase()} ${startTimeOf(s)}` : 'les';
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Rooster beheren"
        subtitle="Weekrooster en uitzonderingen"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.actions}>
          <ActionButton icon="＋" label="Vaste les" onPress={() => router.push({ pathname: '/admin/les-form', params: { kind: 'vast' } })} />
          <ActionButton icon="＋" label="Extra les" onPress={() => router.push({ pathname: '/admin/les-form', params: { kind: 'extra' } })} />
          <ActionButton icon="🌴" label="Vakantie" onPress={() => router.push('/admin/vervallen')} />
        </View>

        <Text style={styles.sectionLabel}>Weekrooster</Text>
        {weekly.map((s) => {
          const meta = styleMeta[s.style];
          return (
            <Pressable
              key={s.id}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => router.push({ pathname: '/admin/les-bewerken', params: { sessionId: s.id } })}>
              <View style={[styles.dot, { backgroundColor: meta.color }]}>
                <Text style={styles.dotLabel}>{meta.dotLabel}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>
                  {s.day} · {startTimeOf(s)}
                </Text>
                <Text style={styles.detail}>
                  {meta.label} · {s.capacity} plekken
                </Text>
                {period(s) ? <Tag label={period(s)} tone="pending" /> : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Uitzonderingen</Text>
        {closures.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={[styles.dot, styles.holidayDot]}>
              <Text style={styles.holidayIcon}>🌴</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{c.reason}</Text>
              <Text style={styles.detail}>
                {c.from === c.to ? dateLabel(c.from) : `${shortDate(c.from)} – ${shortDate(c.to)}`}
              </Text>
              <Tag label={c.sessionId ? `Alleen ${sessionLabel(c.sessionId)} vervalt` : 'Alle lessen vervallen'} tone="muted" />
            </View>
            <RemoveButton
              onPress={() =>
                setConfirm({
                  title: 'Uitzondering verwijderen?',
                  message: 'De lessen in deze periode gaan dan gewoon door.',
                  confirmLabel: 'Verwijderen',
                  onConfirm: () => removeClosure(c.id),
                })
              }
            />
          </View>
        ))}
        {extras.map((s) => {
          const meta = styleMeta[s.style];
          return (
            <View key={s.id} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: meta.color }]}>
                <Text style={styles.dotLabel}>{meta.dotLabel}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>Extra: {meta.label}</Text>
                <Text style={styles.detail}>
                  {dateLabel(s.from!)} · {s.time}
                </Text>
                <Tag label={`Eenmalig · ${s.capacity} plekken`} tone="pending" />
              </View>
              <RemoveButton
                onPress={() =>
                  setConfirm({
                    title: 'Extra les verwijderen?',
                    message: `${meta.label} ${shortDate(s.from!)} ${startTimeOf(s)}. Aanvragen en boekingen voor deze les vervallen ook.`,
                    confirmLabel: 'Verwijderen',
                    onConfirm: () => removeExtraSession(s.id),
                  })
                }
              />
            </View>
          );
        })}
        {closures.length === 0 && extras.length === 0 ? (
          <Text style={styles.note}>Geen vakanties of extra lessen gepland.</Text>
        ) : null}
      </ScrollView>
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </View>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.rowPressed]} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function RemoveButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.removeBtn} onPress={onPress} hitSlop={10}>
      <Text style={styles.removeBtnText}>✕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: 20,
    paddingTop: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 12,
  },
  actionIcon: {
    fontSize: 18,
    color: colors.ink,
    marginBottom: 2,
  },
  actionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: colors.ink,
  },
  sectionLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
    marginBottom: 10,
  },
  sectionSpaced: {
    marginTop: 8,
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
  rowPressed: {
    transform: [{ scale: 0.98 }],
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: '#fff',
  },
  holidayDot: {
    backgroundColor: '#FCF1DE',
  },
  holidayIcon: {
    fontSize: 18,
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
    marginTop: 1,
  },
  chevron: {
    fontSize: 22,
    color: colors.sand,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.rani,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.mutedText,
  },
});
