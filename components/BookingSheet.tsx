import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdminLessonPanel from '@/components/AdminLessonPanel';
import type { ConfirmRequest } from '@/components/ConfirmDialog';
import Stepper from '@/components/Stepper';
import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useCurrentUser } from '@/contexts/UsersContext';
import { classDescriptions } from '@/data/schedule';
import { dateLabel, shortDate } from '@/lib/dutchDate';
import { cancelNotice, LATE_CANCEL_HOURS } from '@/lib/schedule';

export type LessonSelection = { sessionId: string; date: string };

type BookingSheetProps = {
  selection: LessonSelection | null;
  onClose: () => void;
  onLoginRequired: () => void;
  onConfirm: (request: ConfirmRequest) => void;
  onToast: (message: string) => void;
};

// Lesson details for one date. Customers book, cancel or rejoin here; the admin
// adjusts that date's capacity, sees and changes the attendee list, or cancels the lesson.
export default function BookingSheet({
  selection,
  onClose,
  onLoginRequired,
  onConfirm,
  onToast,
}: BookingSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const user = useCurrentUser();
  const schedule = useSchedule();
  const session = selection ? schedule.sessionById(selection.sessionId) : undefined;

  const renderBody = () => {
    if (!selection || !session) return null;
    const { date } = selection;
    const meta = styleMeta[session.style];
    const occupancy = schedule.occupancy(session.id, date);
    const isFull = occupancy.available <= 0;
    const started = schedule.hasStarted(session, date);
    const closure = schedule.closureOf(session.id, date);
    const lessonName = `${meta.label} ${shortDate(date)} ${session.time.split(' – ')[0]}`;

    const header = (
      <>
        <Text style={styles.title}>{meta.label}</Text>
        <Text style={styles.subtitle}>
          {dateLabel(date)} · {session.time} · Berghem
        </Text>
        <Text style={[styles.spots, isFull && styles.spotsFull]}>
          {isFull ? 'Vol' : `${occupancy.available} / ${occupancy.capacity} plekken beschikbaar`}
        </Text>
        {/* The admin knows the lesson; customers get the description. */}
        {user?.role !== 'admin' ? <Text style={styles.desc}>{classDescriptions[session.style]}</Text> : null}
      </>
    );

    if (closure) {
      const singleDate = closure.from === closure.to && closure.sessionId === session.id;
      return (
        <>
          {header}
          <Text style={[styles.note, styles.noteMuted]}>
            Deze les vervalt: {closure.reason}
            {closure.from !== closure.to ? ` (${shortDate(closure.from)} – ${shortDate(closure.to)})` : ''}
          </Text>
          {user?.role !== 'admin' ? (
            <SheetButton label="Les vervalt" disabled />
          ) : singleDate ? (
            <SheetButton
              label="Les toch laten doorgaan"
              tone="teal"
              onPress={() => {
                schedule.removeClosure(closure.id);
                onToast('Les gaat door ✓');
              }}
            />
          ) : (
            <Text style={styles.hint}>Aanpassen via Profiel → Rooster beheren.</Text>
          )}
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          {header}
          <View style={styles.adminPanel}>
            <Text style={styles.adminLabel}>Beheer plekken · {dateLabel(date).toLowerCase()}</Text>
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>Totaal aantal plekken</Text>
              <Stepper value={occupancy.capacity} onChange={(d) => schedule.adjustCapacity(session.id, date, d)} />
            </View>
            <View style={[styles.stepperRow, styles.lastRow]}>
              <Text style={styles.stepperLabel}>Bezet</Text>
              <Text style={styles.bookedValue}>{occupancy.booked}</Text>
            </View>
          </View>
          <AdminLessonPanel session={session} date={date} onToast={onToast} />
          {!started ? (
            <SheetButton
              label="Les laten vervallen op deze datum"
              tone="outline"
              onPress={() =>
                onConfirm({
                  title: 'Les laten vervallen?',
                  message: `${lessonName}. Wie ingepland staat ziet "Vervalt" en krijgt geen strip afgeschreven.`,
                  confirmLabel: 'Laten vervallen',
                  onConfirm: () => {
                    schedule.addClosure({ from: date, to: date, sessionId: session.id, reason: 'Les vervalt' });
                    onToast('Les vervalt');
                  },
                })
              }
            />
          ) : null}
        </>
      );
    }

    if (!user) {
      return (
        <>
          {header}
          <SheetButton label="Inloggen" onPress={onLoginRequired} />
        </>
      );
    }

    const status = schedule.statusFor(user.email, session.id, date);
    const late = schedule.isLateCancel(session, date);
    const paysStrip = late && (user.strippen ?? 0) > 0;
    const charged = !!schedule.cancellationOf(user.email, session.id, date)?.charged;
    if (status && !status.cancelled && status.source !== 'aanvraag') {
      return (
        <>
          {header}
          <Text style={styles.note}>✓ Je staat ingepland ({status.source === 'vast' ? 'vaste les' : 'losse les'})</Text>
          {started ? (
            <SheetButton label="Les is al begonnen" disabled />
          ) : (
            <>
              <SheetButton
                label="Afmelden voor deze les"
                tone="outline"
                onPress={() =>
                  onConfirm({
                    title: 'Afmelden voor deze les?',
                    message: `${lessonName}. ${cancelNotice(late, paysStrip)}`,
                    confirmLabel: paysStrip ? 'Afmelden (−1 strip)' : 'Afmelden',
                    onConfirm: () => {
                      schedule.cancelLesson(user.email, session.id, date, 'klant');
                      onToast(paysStrip ? 'Afgemeld — 1 strip afgeschreven' : 'Afgemeld — telt niet mee');
                    },
                  })
                }
              />
              <Text style={[styles.hint, late && styles.hintLate]}>
                {late
                  ? `Deze les begint binnen ${LATE_CANCEL_HOURS} uur: afmelden kost 1 strip.`
                  : `Kosteloos afmelden tot ${LATE_CANCEL_HOURS} uur voor aanvang. Daarna gaat er 1 strip af.`}
              </Text>
            </>
          )}
        </>
      );
    }
    if (status?.cancelled) {
      return (
        <>
          {header}
          <Text style={[styles.note, styles.noteMuted]}>
            Je hebt je afgemeld voor deze les{charged ? ` (binnen ${LATE_CANCEL_HOURS} uur, 1 strip afgeschreven)` : ''}
          </Text>
          {!started && !isFull ? (
            <SheetButton
              label={charged ? 'Toch weer aanmelden (strip terug)' : 'Toch weer aanmelden'}
              tone="teal"
              onPress={() => {
                if (schedule.undoCancel(user.email, session.id, date)) {
                  onToast(charged ? 'Weer aangemeld ✓ — strip teruggezet' : 'Weer aangemeld ✓');
                }
              }}
            />
          ) : (
            <SheetButton label="Geen plek meer vrij" disabled />
          )}
        </>
      );
    }
    if (status?.source === 'aanvraag') {
      return (
        <>
          {header}
          <SheetButton label="Aangevraagd — wacht op goedkeuring" disabled />
        </>
      );
    }
    return (
      <>
        {header}
        {isFull ? (
          <SheetButton label="Vol — geen plekken meer" disabled />
        ) : (
          <SheetButton
            label="Plek reserveren"
            onPress={() => {
              if (schedule.requestLesson(session.id, date, { name: user.name, email: user.email })) {
                onClose();
                onToast('Reservering aangevraagd ✓');
              }
            }}
          />
        )}
      </>
    );
  };

  return (
    <Modal visible={selection !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]}
          onPress={(e) => e.stopPropagation()}>
          <Pressable style={styles.closeX} onPress={onClose} hitSlop={10}>
            <Text style={styles.closeXText}>✕</Text>
          </Pressable>
          <View style={styles.handle} />
          {user?.role === 'admin' ? (
            <ScrollView style={{ maxHeight: height * 0.78 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {renderBody()}
            </ScrollView>
          ) : (
            renderBody()
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetButton({
  label,
  onPress,
  disabled,
  tone = 'rani',
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'rani' | 'teal' | 'outline';
}) {
  return (
    <Pressable
      style={[
        styles.bookBtn,
        tone === 'teal' && styles.bookBtnTeal,
        tone === 'outline' && styles.bookBtnOutline,
        disabled && styles.bookBtnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={[styles.bookBtnText, tone === 'outline' && !disabled && styles.bookBtnTextOutline]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18,38,26,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.ivory,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  closeX: {
    position: 'absolute',
    top: 16,
    right: 18,
    zIndex: 1,
  },
  closeXText: {
    fontSize: 18,
    color: colors.ink,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: colors.sand,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.ink,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: 6,
  },
  spots: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.teal,
    marginBottom: 16,
  },
  spotsFull: {
    color: colors.rani,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.descText,
    marginBottom: 18,
  },
  note: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.teal,
    marginBottom: 12,
  },
  noteMuted: {
    color: colors.mutedText,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.mutedText,
  },
  hintLate: {
    fontFamily: fonts.bodySemiBold,
    color: colors.rani,
  },
  adminPanel: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  adminLabel: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.rani,
    marginBottom: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  lastRow: {
    marginBottom: 0,
  },
  stepperLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  bookedValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
    minWidth: 28,
    textAlign: 'center',
    marginRight: 34,
  },
  bookBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  bookBtnTeal: {
    backgroundColor: colors.teal,
  },
  bookBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.rani,
    paddingVertical: 13.5,
  },
  bookBtnDisabled: {
    backgroundColor: colors.sand,
    borderWidth: 0,
  },
  bookBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
  bookBtnTextOutline: {
    color: colors.rani,
  },
});
