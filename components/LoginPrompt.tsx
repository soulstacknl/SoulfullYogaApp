import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';

// Full screen for a tab that needs an account: header, short reason and a button to log in.
export default function LoginPrompt({ title, subtitle, text }: { title: string; subtitle: string; text: string }) {
  return (
    <View style={styles.container}>
      <ScreenHeader title={title} subtitle={subtitle} />
      <View style={styles.prompt}>
        <Text style={styles.icon}>🧘</Text>
        <Text style={styles.text}>{text}</Text>
        <Pressable style={styles.btn} onPress={() => router.push('/profiel')}>
          <Text style={styles.btnText}>Inloggen</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  prompt: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 40 },
  icon: { fontSize: 44, marginBottom: 14 },
  text: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.descText,
    textAlign: 'center',
    marginBottom: 22,
  },
  btn: {
    alignSelf: 'stretch',
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  btnText: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: '#fff' },
});
