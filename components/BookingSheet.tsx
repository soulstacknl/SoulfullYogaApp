import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, styleMeta } from '@/constants/theme';
import { classDescriptions } from '@/data/schedule';
import type { ClassSession } from '@/data/schedule';

type BookingSheetProps = {
  session: (ClassSession & { day: string }) | null;
  isAdmin: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onAdjustCapacity: (delta: number) => void;
  onAdjustAvailable: (delta: number) => void;
};

export default function BookingSheet({
  session,
  isAdmin,
  onClose,
  onConfirm,
  onAdjustCapacity,
  onAdjustAvailable,
}: BookingSheetProps) {
  const insets = useSafeAreaInsets();
  const visible = session !== null;
  const meta = session ? styleMeta[session.style] : null;
  const isFull = session ? session.available <= 0 : false;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]}
          onPress={(e) => e.stopPropagation()}>
          <Pressable style={styles.closeX} onPress={onClose} hitSlop={10}>
            <Text style={styles.closeXText}>✕</Text>
          </Pressable>
          <View style={styles.handle} />
          {session && meta ? (
            <>
              <Text style={styles.title}>{meta.label}</Text>
              <Text style={styles.subtitle}>
                {session.day} · {session.time} · Berghem
              </Text>
              <Text style={[styles.spots, isFull && styles.spotsFull]}>
                {isFull ? 'Vol' : `${session.available} / ${session.capacity} plekken beschikbaar`}
              </Text>
              <Text style={styles.desc}>{classDescriptions[session.style]}</Text>

              {isAdmin ? (
                <View style={styles.adminPanel}>
                  <Text style={styles.adminLabel}>Beheer plekken</Text>
                  <View style={styles.stepperRow}>
                    <Text style={styles.stepperLabel}>Totaal aantal plekken</Text>
                    <View style={styles.stepper}>
                      <Pressable style={styles.stepperBtn} onPress={() => onAdjustCapacity(-1)} hitSlop={8}>
                        <Text style={styles.stepperBtnText}>–</Text>
                      </Pressable>
                      <Text style={styles.stepperValue}>{session.capacity}</Text>
                      <Pressable style={styles.stepperBtn} onPress={() => onAdjustCapacity(1)} hitSlop={8}>
                        <Text style={styles.stepperBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.stepperRow}>
                    <Text style={styles.stepperLabel}>Beschikbare plekken</Text>
                    <View style={styles.stepper}>
                      <Pressable style={styles.stepperBtn} onPress={() => onAdjustAvailable(-1)} hitSlop={8}>
                        <Text style={styles.stepperBtnText}>–</Text>
                      </Pressable>
                      <Text style={styles.stepperValue}>{session.available}</Text>
                      <Pressable style={styles.stepperBtn} onPress={() => onAdjustAvailable(1)} hitSlop={8}>
                        <Text style={styles.stepperBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ) : null}

              <Pressable
                style={[styles.bookBtn, isFull && styles.bookBtnDisabled]}
                onPress={onConfirm}
                disabled={isFull}>
                <Text style={styles.bookBtnText}>
                  {isFull ? 'Vol — geen plekken meer' : 'Boek deze les — €15'}
                </Text>
              </Pressable>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,19,45,0.55)',
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
  stepperLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ivory,
    lineHeight: 18,
  },
  stepperValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
    minWidth: 28,
    textAlign: 'center',
  },
  bookBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  bookBtnDisabled: {
    backgroundColor: colors.sand,
  },
  bookBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
});
