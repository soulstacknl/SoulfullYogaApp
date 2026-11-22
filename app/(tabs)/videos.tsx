import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import LoginPrompt from '@/components/LoginPrompt';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts } from '@/constants/theme';
import type { ClassStyle } from '@/constants/theme';
import { useCurrentUser } from '@/contexts/UsersContext';
import { videos } from '@/data/videos';
import { challengeDays, challengeImage } from '@/data/yinChallenge';

const gradients: Record<ClassStyle, [string, string]> = {
  yin: [colors.teal, '#2C8B7A'],
  flow: [colors.rani, '#E2679A'],
  gentle: [colors.marigold, '#F2C06E'],
};

// Photo of day 1, step 1: the face of the Yin challenge.
const challengeCover = challengeImage(challengeDays[0].steps[0].image, 'step');

// One large block in the grid: picture (or gradient) with the title below it.
function Tile({ title, sub, onPress, children }: { title: string; sub?: string; onPress?: () => void; children: ReactNode }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <View style={styles.tileMedia}>{children}</View>
      <View style={styles.tileInfo}>
        <Text style={styles.tileTitle} numberOfLines={2}>
          {title}
        </Text>
        {sub ? <Text style={styles.tileSub}>{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

// Inspiratie: large blocks with media to practise with at home, two side by side.
// The Yin challenge is the first block (top left); videos, photos and files follow.
export default function InspiratieScreen() {
  const user = useCurrentUser();
  if (!user) {
    return (
      <LoginPrompt
        title="Inspiratie"
        subtitle="Oefen op jouw moment, in jouw tempo"
        text="Log in om de Yin challenge en andere inspiratie te bekijken."
      />
    );
  }
  return (
    <View style={styles.container}>
      <ScreenHeader title="Inspiratie" subtitle="Oefen op jouw moment, in jouw tempo" />
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <Tile title="Yin challenge" onPress={() => router.push('/yin-challenge' as Href)}>
          <Image source={{ uri: challengeCover }} style={styles.fill} resizeMode="cover" />
        </Tile>
        {videos.map((video) => (
          <Tile key={video.id} title={video.title} sub={`${video.durationMinutes} min · ${video.level}`}>
            <LinearGradient colors={gradients[video.style]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.fill, styles.center]}>
              <View style={styles.play}>
                <View style={styles.playTriangle} />
              </View>
            </LinearGradient>
          </Tile>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14, padding: 20, paddingBottom: 32 },
  tile: {
    width: '48%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  tileMedia: { width: '100%', aspectRatio: 4 / 5, backgroundColor: colors.sand },
  fill: { width: '100%', height: '100%' },
  center: { alignItems: 'center', justifyContent: 'center' },
  tileInfo: { paddingHorizontal: 12, paddingVertical: 10 },
  tileTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  tileSub: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedText, marginTop: 2 },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    marginLeft: 3,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.ink,
  },
});
