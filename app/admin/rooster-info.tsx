import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';

export default function RoosterInfoScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Terug"
        onBack={() => router.back()}
        eyebrow="Docentmodus"
        title="Rooster beheren"
        subtitle=""
      />
      <View style={styles.content}>
        <Text style={styles.icon}>🗓️</Text>
        <Text style={styles.message}>
          Ga naar de Rooster-tab en tik op de betreffende les om het aantal plekken aan te passen.
        </Text>
        <Pressable style={styles.button} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>Naar Rooster</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 40,
    marginBottom: 16,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 28,
  },
  button: {
    backgroundColor: colors.rani,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: '#fff',
  },
});
