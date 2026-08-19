import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type WeeksPromptProps = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: (weeks: number) => void;
};

export default function WeeksPrompt({ visible, title, confirmLabel, onCancel, onConfirm }: WeeksPromptProps) {
  const [weeks, setWeeks] = useState(1);

  useEffect(() => {
    if (visible) setWeeks(1);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.label}>Aantal weken</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperBtn} onPress={() => setWeeks((w) => Math.max(1, w - 1))} hitSlop={10}>
              <Text style={styles.stepperBtnText}>–</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{weeks}</Text>
            <Pressable style={styles.stepperBtn} onPress={() => setWeeks((w) => w + 1)} hitSlop={10}>
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.quickRow}>
            {[1, 4, 12, 99].map((n) => (
              <Pressable key={n} style={styles.quickBtn} onPress={() => setWeeks(n)}>
                <Text style={styles.quickBtnText}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.confirmBtn} onPress={() => onConfirm(weeks)}>
            <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Annuleren</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,19,45,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    backgroundColor: colors.ivory,
    borderRadius: 22,
    padding: 22,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 14,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.ivory,
    lineHeight: 22,
  },
  stepperValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
    minWidth: 40,
    textAlign: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  quickBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  quickBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
  },
  confirmBtn: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
  cancelBtn: {
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.mutedText,
  },
});
