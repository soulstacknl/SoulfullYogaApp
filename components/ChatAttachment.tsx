import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';
import type { Message } from '@/lib/inbox';
import { euro, fileIcon, fileSizeLabel } from '@/lib/inbox';

// The card inside a chat bubble for a payment request or a file sent by the studio.
export default function ChatAttachment({ message: m, isAdmin }: { message: Message; isAdmin: boolean }) {
  return m.kind === 'betaalverzoek' ? <PaymentCard message={m} isAdmin={isAdmin} /> : <FileCard message={m} />;
}

// Amount, description and status. The customer pays through the link (bank or Tikkie);
// the admin marks it as paid by hand.
function PaymentCard({ message: m, isAdmin }: { message: Message; isAdmin: boolean }) {
  const inbox = useInbox();
  const paid = !!m.paidAt;
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Betaalverzoek</Text>
      <Text style={styles.amount}>{euro(m.amountCents ?? 0)}</Text>
      <Text style={styles.description}>{m.body}</Text>
      <Text style={[styles.status, paid ? styles.paid : styles.open]}>
        {paid
          ? `✓ Betaald · ${new Date(m.paidAt!).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`
          : 'Nog niet betaald'}
      </Text>
      {!paid && m.payUrl ? (
        <Pressable style={styles.payBtn} onPress={() => Linking.openURL(m.payUrl!)}>
          <Text style={styles.payBtnText}>{isAdmin ? 'Betaallink openen' : 'Betalen'}</Text>
        </Pressable>
      ) : null}
      {isAdmin ? (
        <Pressable style={styles.markBtn} onPress={() => inbox.setPaid(m.id, !paid)} hitSlop={6}>
          <Text style={styles.markBtnText}>{paid ? 'Toch nog niet betaald' : '✓ Markeer als betaald'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Photos show inline; videos and documents open in the phone's viewer or the browser.
function FileCard({ message: m }: { message: Message }) {
  const inbox = useInbox();
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const isImage = !!m.fileType?.startsWith('image/');

  useEffect(() => {
    let active = true;
    if (m.filePath) {
      inbox
        .fileUrl(m.filePath)
        .then((u) => active && setUrl(u))
        .catch(() => active && setFailed(true));
    }
    return () => {
      active = false;
    };
    // Only when the file changes; the link stays valid for an hour.
  }, [m.filePath]);

  const open = () => url && Linking.openURL(url);

  if (isImage && url) {
    return (
      <Pressable onPress={open}>
        <Image source={{ uri: url }} style={styles.image} resizeMode="cover" accessibilityLabel={m.body} />
      </Pressable>
    );
  }
  return (
    <Pressable style={styles.card} onPress={open} disabled={!url}>
      <View style={styles.fileRow}>
        <Text style={styles.fileIcon}>{fileIcon(m.fileType)}</Text>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>
            {m.body}
          </Text>
          <Text style={styles.fileMeta}>
            {failed ? 'Kan het bestand niet laden' : url ? `${fileSizeLabel(m.fileSize)} · tik om te openen` : 'Laden…'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 14,
    padding: 12,
    minWidth: 210,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.rani,
  },
  amount: { fontFamily: fonts.display, fontSize: 24, color: colors.ink, marginTop: 2 },
  description: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: colors.ink, marginTop: 2 },
  status: {
    alignSelf: 'flex-start',
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  paid: { backgroundColor: '#EAF3EE', color: colors.teal },
  open: { backgroundColor: '#FCF1DE', color: '#9A6512' },
  payBtn: { backgroundColor: colors.rani, borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 10 },
  payBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#fff' },
  markBtn: { alignItems: 'center', paddingTop: 10 },
  markBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.teal },
  image: { width: 220, height: 220, borderRadius: 12, backgroundColor: colors.sand },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileIcon: { fontSize: 26 },
  fileInfo: { flexShrink: 1 },
  fileName: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.ink },
  fileMeta: { fontFamily: fonts.body, fontSize: 11.5, color: colors.mutedText, marginTop: 1 },
});
