import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, styleMeta } from '@/constants/theme';
import { useSchedule } from '@/contexts/ScheduleContext';
import type { ReservationRequest } from '@/contexts/ScheduleContext';
import { dateLabel } from '@/lib/dutchDate';

type RequestActionSheetProps = {
  request: ReservationRequest | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export default function RequestActionSheet({ request, onClose, onApprove, onReject }: RequestActionSheetProps) {
  const insets = useSafeAreaInsets();
  const visible = request !== null;
  const { sessionById } = useSchedule();
  const session = request ? sessionById(request.sessionId) : undefined;
  const meta = session ? styleMeta[session.style] : null;

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
          {request && session && meta ? (
            <>
              <Text style={styles.title}>{request.name}</Text>
              <Text style={styles.subtitle}>
                {meta.label} · {dateLabel(request.date)} · {session.time}
              </Text>
              <Text style={styles.email}>{request.email}</Text>

              <View style={styles.actions}>
                <Pressable style={[styles.actionBtn, styles.approveBtn]} onPress={onApprove}>
                  <Text style={styles.actionBtnText}>✓ Goedkeuren</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
                  <Text style={styles.actionBtnText}>✕ Weigeren</Text>
                </Pressable>
              </View>
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
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#A89BB5',
    marginTop: 2,
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: colors.teal,
  },
  rejectBtn: {
    backgroundColor: colors.rani,
  },
  actionBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#fff',
  },
});
