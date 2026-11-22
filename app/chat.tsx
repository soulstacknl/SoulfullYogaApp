import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TEACHER_NAME, teacherPhoto } from '@/components/BerichtenParts';
import ChatThread from '@/components/ChatThread';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { useCurrentUser, useUsers } from '@/contexts/UsersContext';
import { shownEmail } from '@/data/users';

// One conversation. A customer always chats with Marjolijn; the admin opens /chat?klant=<id>.
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const { users } = useUsers();
  const { klant } = useLocalSearchParams<{ klant?: string }>();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/berichten'));
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Berichten" onBack={back} title="Chat" subtitle="" />
        <Text style={styles.note}>Log in om te chatten.</Text>
      </View>
    );
  }

  const isAdmin = user.role === 'admin';
  const customer = isAdmin ? users.find((u) => u.id === klant) : user;
  if (!customer) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Berichten" onBack={back} title="Chat" subtitle="" />
        <Text style={styles.note}>Dit gesprek bestaat niet (meer).</Text>
      </View>
    );
  }

  // Android draws edge-to-edge, so the window no longer shrinks for the keyboard by itself:
  // pad on both platforms, and drop the bottom safe area while the keyboard covers it.
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {isAdmin ? (
        <ScreenHeader backLabel="Berichten" onBack={back} eyebrow="Chat" title={customer.name} subtitle={[shownEmail(customer.email), customer.phone].filter(Boolean).join(' · ')} />
      ) : (
        <ScreenHeader backLabel="Berichten" onBack={back} eyebrow="Soulful Yoga" title={TEACHER_NAME} subtitle="Reageert meestal binnen een dag" photo={teacherPhoto} />
      )}
      <ChatThread
        customerId={customer.id}
        bottomInset={keyboardOpen ? 0 : insets.bottom}
        emptyText={isAdmin ? `Stuur ${customer.name.split(' ')[0]} een bericht.` : `Heb je een vraag? Stuur ${TEACHER_NAME} een bericht.`}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  note: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, textAlign: 'center', marginTop: 30 },
});
