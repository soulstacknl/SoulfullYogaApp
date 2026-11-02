import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ScrollViewInstance, StyleProp, ViewStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { useInbox } from '@/contexts/InboxContext';
import { useCurrentUser } from '@/contexts/UsersContext';
import { clockTime } from '@/lib/inbox';

const DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const dayKey = (iso: string) => new Date(iso).toDateString();
function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Vandaag';
  if (d.toDateString() === yesterday.toDateString()) return 'Gisteren';
  return `${DAYS[d.getDay()][0].toUpperCase()}${DAYS[d.getDay()].slice(1)} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

type ChatThreadProps = {
  customerId: string;
  emptyText: string;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
};

// One conversation: bubbles grouped per day and a typing bar. Used in the app and the portal.
export default function ChatThread({ customerId, emptyText, bottomInset = 0, style }: ChatThreadProps) {
  const inbox = useInbox();
  const isAdmin = useCurrentUser()?.role === 'admin';
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const messages = inbox.messagesOf(customerId);
  const mine = (fromStudio: boolean) => fromStudio === isAdmin;
  const lastMine = [...messages].reverse().find((m) => mine(m.fromStudio));

  // Reading the conversation clears the unread count for this side.
  // markChatRead does nothing when there is nothing unread, so running it on every change is fine.
  const { markChatRead } = inbox;
  useEffect(() => {
    markChatRead(customerId);
  }, [customerId, markChatRead]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft('');
    if (!(await inbox.send(customerId, body))) setDraft(body);
    setSending(false);
  };

  return (
    <View style={[styles.wrap, style]}>
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={styles.bubbles}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled">
        {messages.length === 0 ? <Text style={styles.empty}>{emptyText}</Text> : null}
        {messages.map((m, i) => {
          const newDay = i === 0 || dayKey(messages[i - 1].at) !== dayKey(m.at);
          const me = mine(m.fromStudio);
          return (
            <View key={m.id}>
              {newDay ? <Text style={styles.day}>{dayLabel(m.at)}</Text> : null}
              <View style={[styles.bubble, me ? styles.me : styles.them]}>
                <Text style={[styles.text, me && { color: colors.ivory }]}>{m.body}</Text>
                <Text style={[styles.time, me && { color: '#BACDC0' }]}>{clockTime(m.at)}</Text>
              </View>
              {m === lastMine && m === messages.at(-1) && inbox.seenByOther(m) ? <Text style={styles.seen}>Gelezen</Text> : null}
            </View>
          );
        })}
      </ScrollView>
      <View style={[styles.bar, { paddingBottom: 10 + bottomInset }]}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Typ een bericht…"
          placeholderTextColor="#9DAFA2"
          multiline
          maxLength={4000}
          // Web: Enter sends, Shift+Enter starts a new line.
          onKeyPress={(e) => {
            const ev = e.nativeEvent as unknown as { key: string; shiftKey?: boolean };
            if (Platform.OS === 'web' && ev.key === 'Enter' && !ev.shiftKey) {
              (e as unknown as { preventDefault: () => void }).preventDefault();
              send();
            }
          }}
        />
        <Pressable style={[styles.send, !draft.trim() && styles.sendOff]} onPress={send} disabled={!draft.trim() || sending} accessibilityLabel="Versturen">
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: { flex: 1 },
  bubbles: { padding: 16, gap: 6 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, textAlign: 'center', marginTop: 30 },
  day: {
    alignSelf: 'center',
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.mutedText,
    backgroundColor: '#EFE6D6',
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  bubble: { maxWidth: '78%', paddingTop: 9, paddingBottom: 7, paddingHorizontal: 12, borderRadius: 16, marginBottom: 6 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.ink, borderBottomRightRadius: 5 },
  them: { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.sand, borderBottomLeftRadius: 5 },
  text: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 20, color: colors.ink },
  time: { fontFamily: fonts.body, fontSize: 10.5, color: colors.mutedText, textAlign: 'right', marginTop: 2 },
  seen: { alignSelf: 'flex-end', fontFamily: fonts.body, fontSize: 11, color: colors.mutedText, marginTop: -2, marginBottom: 4 },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.sand,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 21,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
    backgroundColor: colors.ivory,
  },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.rani, alignItems: 'center', justifyContent: 'center' },
  sendOff: { backgroundColor: colors.sand },
  sendText: { color: '#fff', fontSize: 17, fontFamily: fonts.bodyBold },
});
