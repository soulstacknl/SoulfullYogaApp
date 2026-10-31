import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

type ConfirmDialogProps = {
  request: ConfirmRequest | null;
  onClose: () => void;
};

// Centered yes/cancel card in the same style as WeeksPrompt.
export default function ConfirmDialog({ request, onClose }: ConfirmDialogProps) {
  return (
    <Modal visible={request !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {request ? (
            <>
              <Text style={styles.title}>{request.title}</Text>
              <Text style={styles.message}>{request.message}</Text>
              <Pressable
                style={styles.confirmBtn}
                onPress={() => {
                  request.onConfirm();
                  onClose();
                }}>
                <Text style={styles.confirmBtnText}>{request.confirmLabel}</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Annuleren</Text>
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
    backgroundColor: 'rgba(18,38,26,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.ivory,
    borderRadius: 22,
    padding: 22,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.descText,
    textAlign: 'center',
    marginBottom: 18,
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
