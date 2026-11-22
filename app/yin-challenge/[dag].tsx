import { router, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import { CHALLENGE_URL, challengeDays, challengeImage, dayTitle } from '@/data/yinChallenge';

// One day of the challenge: the steps under each other, each with a photo and its explanation.
export default function ChallengeDayScreen() {
  const { dag } = useLocalSearchParams<{ dag: string }>();
  const day = challengeDays.find((d) => String(d.day) === dag);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/yin-challenge' as Href));
  const go = (n: number) => router.replace(`/yin-challenge/${n}` as Href);

  if (!day) {
    return (
      <View style={styles.container}>
        <ScreenHeader backLabel="Yin challenge" onBack={back} title="Yin challenge" subtitle="" />
        <Text style={styles.empty}>Deze dag bestaat niet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        backLabel="Yin challenge"
        onBack={back}
        eyebrow="Yin challenge"
        title={dayTitle(day)}
        subtitle={day.meditation ? 'Een moment van rust en aandacht' : `${day.steps.length} houdingen · neem de tijd voor elke houding`}
      />
      <ScrollView key={day.day} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {day.meditation ? (
          <View style={[styles.card, styles.body]}>
            <Text style={styles.stepTitle}>Meditatie</Text>
            <Text style={styles.line}>
              De meditatie van vandaag is een geluidsopname. Je luistert hem op de website van Soulful Yoga, bij {dayTitle(day)}.
            </Text>
            <Pressable style={styles.linkBtn} onPress={() => Linking.openURL(CHALLENGE_URL)}>
              <Text style={styles.linkBtnText}>Naar de meditatie op de website</Text>
            </Pressable>
          </View>
        ) : (
          day.steps.map((step, i) => (
            <View key={i} style={styles.card}>
              <Image source={{ uri: challengeImage(step.image, 'step') }} style={styles.photo} resizeMode="cover" accessibilityLabel={step.title} />
              <View style={styles.body}>
                <Text style={styles.stepNo}>Stap {i + 1}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.lines.map((line, j) => (
                  <Text key={j} style={styles.line}>
                    {line}
                  </Text>
                ))}
                {step.duration ? <Text style={styles.duration}>⏱ {step.duration}</Text> : null}
              </View>
            </View>
          ))
        )}

        <View style={styles.nav}>
          {day.day > 1 ? (
            <Pressable style={styles.navBtn} onPress={() => go(day.day - 1)}>
              <Text style={styles.navText}>‹ Dag {day.day - 1}</Text>
            </Pressable>
          ) : (
            <View style={styles.navSpacer} />
          )}
          {day.day < challengeDays.length ? (
            <Pressable style={[styles.navBtn, styles.navNext]} onPress={() => go(day.day + 1)}>
              <Text style={[styles.navText, styles.navNextText]}>Dag {day.day + 1} ›</Text>
            </Pressable>
          ) : (
            <View style={styles.navSpacer} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 40 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.mutedText, textAlign: 'center', marginTop: 30 },
  card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.sand, overflow: 'hidden', marginBottom: 16 },
  photo: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.sand },
  body: { padding: 16 },
  stepNo: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.teal, marginBottom: 2 },
  stepTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginBottom: 6 },
  line: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.descText, marginBottom: 6 },
  duration: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.teal, marginTop: 4 },
  linkBtn: { backgroundColor: colors.teal, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  linkBtnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#fff' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  navSpacer: { flex: 1 },
  navBtn: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.sand, backgroundColor: colors.card, paddingVertical: 13, alignItems: 'center' },
  navNext: { backgroundColor: colors.ink, borderColor: colors.ink },
  navText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  navNextText: { color: colors.ivory },
});
