import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ConfirmDialog from '@/components/ConfirmDialog';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import LessonCard from '@/components/LessonCard';
import ScreenHeader from '@/components/ScreenHeader';
import type { TagTone } from '@/components/Tag';
import Toast, { useToast } from '@/components/Toast';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { Lesson } from '@/contexts/ScheduleContext';
import { useCurrentUser } from '@/contexts/UsersContext';
import { capitalize, isoOf, monthStart, MONTHS, shortDate, toDate } from '@/lib/dutchDate';
import { currentStandingSession, MONTHS_AHEAD, startTimeOf } from '@/lib/schedule';

type Segment = 'komend' | 'afgenomen';

// What a customer is scheduled for: upcoming lessons (with cancel) and the
// finished ones, each showing whether it cost a strip.
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
  const upcomingCount = upcoming.filter((l) => !l.status.cancelled && !l.closure).length;
  const takenCount = past.filter((l) => {
    const charge = schedule.chargeFor(user.email, l.session.id, l.date);
    return charge === 'strip' || charge === 'open' || charge === 'los';
  }).length;

  const standing = currentStandingSession(schedule.data, user.email, schedule.today);
  const lessonName = (l: Lesson) =>
    `${styleMeta[l.session.style].label} ${shortDate(l.date)} ${startTimeOf(l.session)}`;

  const askCancel = (l: Lesson) =>
    setConfirm({
      title: 'Afmelden voor deze les?',
      message: `${lessonName(l)}. Deze les telt dan niet mee en er gaat geen strip af.`,
      confirmLabel: 'Afmelden',
      onConfirm: () => {
        schedule.cancelLesson(user.email, l.session.id, l.date, 'klant');
        toast.show('Afgemeld — telt niet mee');
      },
    });

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
        ? { label: 'Afgemeld · telde niet mee', tone: 'muted' }
        : charge === undefined
          ? { label: 'Wacht op bevestiging docent', tone: 'pending' }
          : charge === 'afwezig'
            ? { label: 'Niet aanwezig · geen strip', tone: 'muted' }
            : charge === 'open'
              ? { label: 'Aanwezig · geen strippen, openstaand', tone: 'rani' }
              : { label: 'Afgenomen · −1 strip', tone: 'teal' };
    } else if (l.status.cancelled) {
      tag = { label: 'Afgemeld · telt niet mee', tone: 'muted' };
      if (schedule.occupancy(l.session.id, l.date).available > 0) {
        action = {
          label: 'Aanmelden',
          tone: 'teal',
          onPress: () => {
            if (schedule.undoCancel(user.email, l.session.id, l.date)) toast.show('Weer aangemeld ✓');
          },
        };
      }
    } else if (l.status.source === 'aanvraag') {
      tag = { label: 'Aangevraagd · wacht op goedkeuring', tone: 'pending' };
    } else {
      tag = l.status.source === 'vast' ? { label: 'Vaste les', tone: 'teal' } : { label: 'Losse les', tone: 'ink' };
      if (!schedule.hasStarted(l.session, l.date)) {
        action = { label: 'Afmelden', tone: 'rani', onPress: () => askCancel(l) };
      }
    }
    return <LessonCard key={key} lesson={l} tag={tag} dimmed={dimmed} action={action} />;
  };

  const renderUpcoming = () => {
    if (upcoming.length === 0) {
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
    return upcoming.map((l) => {
      const m = toDate(l.date).getMonth();
      const showMonth = m !== lastMonth;
      const isFirst = lastMonth === -1;
      lastMonth = m;
      return (
        <View key={`${l.session.id}-${l.date}`}>
          {showMonth ? (
            <Text style={[styles.monthLabel, isFirst && styles.monthLabelFirst]}>{capitalize(MONTHS[m])}</Text>
          ) : null}
          {renderCard(l, false)}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Mijn lessen"
        subtitle={standing ? `Vaste les: ${standing.day.toLowerCase()} ${startTimeOf(standing)}` : 'Geen vaste les'}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stripBar}>
          <Text style={styles.stripLabel}>Strippenkaart</Text>
          {user.strippen === null ? (
            <Text style={styles.stripCount}>Geen kaart</Text>
          ) : (
            <Text style={styles.stripCount}>
              {user.strippen} <Text style={styles.stripTotal}>/ {user.total} over</Text>
            </Text>
          )}
        </View>

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
            : past.length
              ? past.map((l) => renderCard(l, true))
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
