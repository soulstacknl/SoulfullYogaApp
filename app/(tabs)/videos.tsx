import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import { colors, fonts, styleMeta } from '@/constants/theme';
import type { ClassStyle } from '@/constants/theme';
import { videos } from '@/data/videos';

type Filter = 'alles' | ClassStyle;

const filters: { key: Filter; label: string }[] = [
  { key: 'alles', label: 'Alles' },
  { key: 'yin', label: 'Yin' },
  { key: 'flow', label: 'Flow' },
  { key: 'gentle', label: 'Gentle' },
];

const gradients: Record<ClassStyle, [string, string]> = {
  yin: [colors.teal, '#2C8B7A'],
  flow: [colors.rani, '#E2679A'],
  gentle: [colors.marigold, '#F2C06E'],
};

export default function VideosScreen() {
  const [filter, setFilter] = useState<Filter>('alles');

  const visibleVideos = videos.filter((v) => filter === 'alles' || v.style === filter);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Video's" subtitle="Oefen op jouw moment, in jouw tempo" />

      <View style={styles.filters}>
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visibleVideos.map((video) => (
          <View key={video.id} style={styles.card}>
            <LinearGradient
              colors={gradients[video.style]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.thumb}>
              <View style={styles.play}>
                <View style={styles.playTriangle} />
              </View>
            </LinearGradient>
            <View style={styles.info}>
              <Text style={styles.name}>{video.title}</Text>
              <Text style={styles.sub}>
                {video.durationMinutes} min · {video.level}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.ivory,
  },
  list: {
    paddingVertical: 10,
    paddingBottom: 24,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  thumb: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  info: {
    padding: 14,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
});
