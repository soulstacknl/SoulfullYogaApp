import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { NewsItem } from '@/lib/inbox';
import { msgTime } from '@/lib/inbox';

export const TEACHER_NAME = 'Marjolijn';
export const teacherPhoto = require('@/assets/images/marjolijn.jpg');

const initials = (name: string) =>
  name.split(' ').filter((w) => /^\p{L}/u.test(w)).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export function SectionHead({ title, action, onAction, first }: { title: string; action?: string; onAction?: () => void; first?: boolean }) {
  return (
    <View style={[styles.head, !first && { marginTop: 18 }]}>
      <Text style={styles.headTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.headAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function NewsCard({ item, unread, onPress }: { item: NewsItem; unread: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsBody} numberOfLines={2}>
        {item.body}
      </Text>
      <Text style={styles.newsDate}>{msgTime(item.at)}</Text>
      {unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

// A conversation: Marjolijn's photo for customers, the customer's initials for the admin.
export function ChatRow({ name, photo, last, time, unread, onPress }: { name: string; photo?: boolean; last: string; time?: string; unread: number; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {photo ? <Image source={teacherPhoto} style={styles.avatar} /> : <View style={[styles.avatar, styles.initials]}><Text style={styles.initialsText}>{initials(name)}</Text></View>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName}>{name}</Text>
          {time ? <Text style={styles.rowTime}>{time}</Text> : null}
        </View>
        <Text style={[styles.rowLast, unread > 0 && styles.rowLastUnread]} numberOfLines={1}>
          {last}
        </Text>
      </View>
      {unread ? <Text style={styles.count}>{unread}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  headTitle: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.rani },
  headAction: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.rani },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10 },
  newsTitle: { fontFamily: fonts.display, fontSize: 15.5, color: colors.ink, paddingRight: 16 },
  newsBody: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.descText, marginTop: 4 },
  newsDate: { fontFamily: fonts.body, fontSize: 11.5, color: colors.mutedText, marginTop: 6 },
  dot: { position: 'absolute', top: 16, right: 14, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.rani },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 9 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  initials: { backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rowName: { fontFamily: fonts.bodySemiBold, fontSize: 14.5, color: colors.ink, flexShrink: 1 },
  rowTime: { fontFamily: fonts.body, fontSize: 11.5, color: colors.mutedText },
  rowLast: { fontFamily: fonts.body, fontSize: 13, color: colors.mutedText, marginTop: 2 },
  rowLastUnread: { fontFamily: fonts.bodySemiBold, color: colors.ink },
  count: { backgroundColor: colors.rani, color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11, borderRadius: 10, minWidth: 20, paddingVertical: 2, paddingHorizontal: 6, textAlign: 'center', overflow: 'hidden' },
});
