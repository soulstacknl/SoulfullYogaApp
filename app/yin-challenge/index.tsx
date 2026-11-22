import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { CHALLENGE_INTRO, CHALLENGE_TITLE, challengeDays, challengeImage, dayTitle } from '@/data/yinChallenge';

// The 30 days of the Yin Yoga challenge under each other; tap a day for its steps.
export default function YinChallengeScreen() {
  const back = () => (router.canGoBack() ? router.back() : router.replace('/videos'));
  return (
    <View style={styles.container}>
      <ScreenHeader backLabel="Inspiratie" onBack={back} eyebrow="Yin challenge" title={CHALLENGE_TITLE} subtitle="Elke dag een mini yin yoga reeks of meditatie" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{CHALLENGE_INTRO}</Text>
        {challengeDays.map((d) => (
          <Pressable
            key={d.day}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            onPress={() => router.push(`/yin-challenge/${d.day}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={dayTitle(d)}>
            <Image source={{ uri: challengeImage(d.thumb, 'thumb') }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.title}>{dayTitle(d)}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 40 },
  intro: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.descText, marginBottom: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: 10,
    marginBottom: 10,
  },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.sand },
  info: { flex: 1 },
  title: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
  chevron: { fontSize: 24, color: colors.sand, paddingRight: 4 },
});
