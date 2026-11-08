import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CardValidity from '@/components/CardValidity';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import LessonCard from '@/components/LessonCard';
import ScreenHeader from '@/components/ScreenHeader';
import type { TagTone } from '@/components/Tag';
import Toast, { useToast } from '@/components/Toast';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { Lesson, PrivateLesson } from '@/contexts/ScheduleContext';
import { useCurrentUser } from '@/contexts/UsersContext';
import { capitalize, isoOf, monthStart, MONTHS, shortDate, toDate } from '@/lib/dutchDate';
import {
  cancelNotice,
  currentStandingSession,
  LATE_CANCEL_HOURS,
  MONTHS_AHEAD,
  privateEnd,
  privateStart,
  startOf,
  startTimeOf,
} from '@/lib/schedule';

type Segment = 'komend' | 'afgenomen';
// Group lessons and private lessons in one list, in time order.
type Item = { at: number; date: string } & ({ lesson: Lesson; prive?: never } | { prive: PrivateLesson; lesson?: never });

// What a customer is scheduled for: upcoming group and private lessons (with cancel)
// and the finished ones, each showing whether it cost a strip.
export default function MijnLessenScreen() {
  const user = useCurrentUser();
  const schedule = useSchedule();
  const [segment, setSegment] = useState<Segment>('komend');
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const toast = useToast();

  if (!user) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Mijn lessen" subtitle="Je planning en geschiedenis" />
        <View style={styles.loginPrompt}>
          <Text style={styles.loginIcon}>🧘</Text>
          <Text style={styles.loginText}>Log in om te zien voor welke lessen je bent ingepland.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/profiel')}>
            <Text style={styles.primaryBtnText}>Inloggen</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const horizon = monthStart(MONTHS_AHEAD + 1, schedule.now);
  horizon.setDate(0); // last day of the furthest bookable month
  const all = schedule.myLessons(user.email, '2000-01-01', isoOf(horizon));
  const upcoming = all.filter((l) => !schedule.isPast(l.session, l.date));
  const past = all.filter((l) => schedule.isPast(l.session, l.date) && l.status.source !== 'aanvraag').reverse();
  const privates = schedule.privatesOf(user.email);
  const upcomingPrivates = privates.filter((p) => privateEnd(p) > schedule.now);
  const pastPrivates = privates.filter((p) => privateEnd(p) <= schedule.now);
  const groupItem = (l: Lesson): Item => ({ lesson: l, date: l.date, at: startOf(l.session, l.date).getTime() });
  const privateItem = (p: PrivateLesson): Item => ({ prive: p, date: p.date, at: privateStart(p).getTime() });
  const upcomingItems = [...upcoming.map(groupItem), ...upcomingPrivates.map(privateItem)].sort((a, b) => a.at - b.at);
  const pastItems = [...past.map(groupItem), ...pastPrivates.map(privateItem)].sort((a, b) => b.at - a.at);

  const upcomingCount =
    upcoming.filter((l) => !l.status.cancelled && !l.closure).length + upcomingPrivates.filter((p) => !p.cancelled).length;
  const takenCount =
    past.filter((l) => {
      const charge = schedule.chargeFor(user.email, l.session.id, l.date);
      return charge === 'strip' || charge === 'open' || charge === 'los';
    }).length + pastPrivates.filter((p) => !p.cancelled).length;

  const standing = currentStandingSession(schedule.data, user.email, schedule.today);
  const lessonName = (l: Lesson) =>
    `${styleMeta[l.session.style].label} ${shortDate(l.date)} ${startTimeOf(l.session)}`;

  const askCancel = (l: Lesson) => {
    const late = schedule.isLateCancel(l.session, l.date);
    const paysStrip = late && (user.strippen ?? 0) > 0;
    setConfirm({
      title: 'Afmelden voor deze les?',
      message: `${lessonName(l)}. ${cancelNotice(late, paysStrip)}`,
      confirmLabel: paysStrip ? 'Afmelden (−1 strip)' : 'Afmelden',
      onConfirm: () => {
        schedule.cancelLesson(user.email, l.session.id, l.date, 'klant');
        toast.show(paysStrip ? 'Afgemeld — 1 strip afgeschreven' : 'Afgemeld — telt niet mee');
      },
    });
  };

  // Private lessons cost no strip; Marjolijn gets a push when the customer cancels.
  const askCancelPrivate = (p: PrivateLesson) =>
    setConfirm({
      title: 'Privéles afmelden?',
      message: `Privéles ${shortDate(p.date)} ${p.time.split(' – ')[0]}. Marjolijn krijgt hiervan bericht.`,
      confirmLabel: 'Afmelden',
      onConfirm: () => {
        schedule.cancelPrivateLesson(p.id);
        toast.show('Afgemeld voor je privéles');
      },
    });

  const renderPrivate = (p: PrivateLesson, isPastLesson: boolean) => (
    <LessonCard
      key={p.id}
      date={p.date}
      title="Privéles"
      time={p.time}
      color={colors.ink}
      dimmed={p.cancelled}
      tag={p.cancelled ? { label: 'Privéles · afgemeld', tone: 'muted' } : { label: 'Privéles', tone: 'rani' }}
      action={
        !isPastLesson && !p.cancelled && privateStart(p) > schedule.now
          ? { label: 'Afmelden', tone: 'rani', onPress: () => askCancelPrivate(p) }
          : undefined
      }
    />
  );

  const renderItem = (item: Item, isPastLesson: boolean) =>
    item.prive ? renderPrivate(item.prive, isPastLesson) : renderCard(item.lesson!, isPastLesson);

  const renderCard = (l: Lesson, isPastLesson: boolean) => {
    const key = `${l.session.id}-${l.date}`;
    const dimmed =
      l.status.cancelled || !!l.closure || (isPastLesson && schedule.chargeFor(user.email, l.session.id, l.date) === 'afwezig');
    let tag: { label: string; tone: TagTone };
    let action: { label: string; tone: 'rani' | 'teal'; onPress: () => void } | undefined;

    if (l.closure) {
      tag = { label: `${isPastLesson ? 'Vervallen' : 'Vervalt'} · ${l.closure.reason.toLowerCase()} · geen strip`, tone: 'muted' };
    } else if (isPastLesson) {
      // Strips only go once the teacher has confirmed the attendance.
      const charge = schedule.chargeFor(user.email, l.session.id, l.date);
      tag = l.status.cancelled
        ? schedule.cancellationOf(user.email, l.session.id, l.date)?.charged
          ? { label: 'Afgemeld binnen 24 uur · −1 strip', tone: 'rani' }
          : { label: 'Afgemeld · telde niet mee', tone: 'muted' }
        : charge === undefined
          ? { label: 'Wacht op bevestiging docent', tone: 'pending' }
          : charge === 'afwezig'
            ? { label: 'Niet aanwezig · geen strip', tone: 'muted' }
            : charge === 'open'
              ? { label: 'Aanwezig · geen strippen, openstaand', tone: 'rani' }
              : { label: 'Afgenomen · −1 strip', tone: 'teal' };
    } else if (l.status.cancelled) {
      const charged = !!schedule.cancellationOf(user.email, l.session.id, l.date)?.charged;
      tag = charged
        ? { label: 'Afgemeld binnen 24 uur · −1 strip', tone: 'rani' }
        : { label: 'Afgemeld · telt niet mee', tone: 'muted' };
      if (!schedule.hasStarted(l.session, l.date) && schedule.occupancy(l.session.id, l.date).available > 0) {
        action = {
          label: 'Aanmelden',
          tone: 'teal',
          onPress: () => {
            if (schedule.undoCancel(user.email, l.session.id, l.date)) {
              toast.show(charged ? 'Weer aangemeld ✓ — strip teruggezet' : 'Weer aangemeld ✓');
            }
          },
        };
      }
    } else if (l.status.source === 'aanvraag') {
      tag = { label: 'Aangevraagd · wacht op goedkeuring', tone: 'pending' };
    } else {
      tag = l.status.source === 'vast' ? { label: 'Groepsles', tone: 'teal' } : { label: 'Losse les', tone: 'ink' };
      if (!schedule.hasStarted(l.session, l.date)) {
        action = { label: 'Afmelden', tone: 'rani', onPress: () => askCancel(l) };
      }
    }
    const meta = styleMeta[l.session.style];
    return (
      <LessonCard key={key} date={l.date} title={meta.label} time={l.session.time} color={meta.color} tag={tag} dimmed={dimmed} action={action} />
    );
  };

  const renderUpcoming = () => {
    if (upcomingItems.length === 0) {
      return (
        <>
          <Text style={styles.empty}>Je staat nog nergens voor ingepland.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/')}>
            <Text style={styles.primaryBtnText}>Bekijk het rooster</Text>
          </Pressable>
        </>
      );
    }
    let lastMonth = -1;
    return upcomingItems.map((item) => {
      const m = toDate(item.date).getMonth();
      const showMonth = m !== lastMonth;
      const isFirst = lastMonth === -1;
      lastMonth = m;
      return (
        <View key={item.prive ? item.prive.id : `${item.lesson.session.id}-${item.date}`}>
          {showMonth ? (
            <Text style={[styles.monthLabel, isFirst && styles.monthLabelFirst]}>{capitalize(MONTHS[m])}</Text>
          ) : null}
          {renderItem(item, false)}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Mijn lessen"
        subtitle={standing ? `Groepsles: ${standing.day.toLowerCase()} ${startTimeOf(standing)}` : 'Geen groepsles'}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stripBar}>
          <View>
            <Text style={styles.stripLabel}>{user.privateStrips !== null ? 'Groepslessen' : 'Strippenkaart'}</Text>
            {user.strippen !== null ? <CardValidity validUntil={user.stripsValidUntil} today={schedule.today} dark /> : null}
          </View>
          {user.strippen === null ? (
            <Text style={styles.stripCount}>Geen kaart</Text>
          ) : (
            <Text style={styles.stripCount}>
              {user.strippen} <Text style={styles.stripTotal}>{user.strippen === 1 ? 'strip' : 'strippen'}</Text>
            </Text>
          )}
        </View>
        {user.privateStrips !== null ? (
          <View style={[styles.stripBar, styles.stripBarPrivate]}>
            <View>
              <Text style={styles.stripLabel}>Privélessen</Text>
            </View>
            <Text style={styles.stripCount}>
              {user.privateStrips} <Text style={styles.stripTotal}>{user.privateStrips === 1 ? 'strip' : 'strippen'}</Text>
            </Text>
          </View>
        ) : null}
        <Text style={styles.cancelRule}>Kosteloos afmelden tot {LATE_CANCEL_HOURS} uur voor aanvang. Daarna gaat er 1 strip af.</Text>

        <View style={styles.segment}>
          {(['komend', 'afgenomen'] as const).map((s) => (
            <Pressable key={s} style={[styles.segmentBtn, segment === s && styles.segmentBtnOn]} onPress={() => setSegment(s)}>
              <Text style={[styles.segmentText, segment === s && styles.segmentTextOn]}>
                {s === 'komend' ? `Komend (${upcomingCount})` : `Afgenomen (${takenCount})`}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {segment === 'komend'
            ? renderUpcoming()
            : pastItems.length
              ? pastItems.map((item) => renderItem(item, true))
              : <Text style={styles.empty}>Nog geen lessen afgenomen.</Text>}
        </View>
      </ScrollView>
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    paddingBottom: 24,
  },
  stripBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  stripBarPrivate: {
    marginTop: 8,
    backgroundColor: '#2E3B2A',
  },
  stripLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.marigold,
  },
  stripCount: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ivory,
  },
  stripTotal: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#BACDC0',
  },
  cancelRule: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.mutedText,
    marginHorizontal: 24,
    marginTop: 8,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#EFE6D6',
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentBtnOn: {
    backgroundColor: colors.card,
  },
  segmentText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.mutedText,
  },
  segmentTextOn: {
    color: colors.ink,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  monthLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
    marginTop: 18,
    marginBottom: 8,
  },
  monthLabelFirst: {
    marginTop: 4,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 24,
  },
  loginPrompt: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  loginIcon: {
    fontSize: 44,
    marginBottom: 14,
  },
  loginText: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.descText,
    textAlign: 'center',
    marginBottom: 22,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
});
