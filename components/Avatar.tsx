import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { avatarUrl } from '@/lib/avatar';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

// A customer's profile photo, or their initials on the gradient when there is none.
export default function Avatar({ path, name, size = 40, style }: { path?: string | null; name: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setUrl(null);
    if (path) avatarUrl(path).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [path]);

  const box = { width: size, height: size, borderRadius: size / 2 };
  if (url) return <Image source={{ uri: url }} style={[box, styles.image, style as object]} />;
  return (
    <View style={[box, style]}>
      <LinearGradient colors={[colors.marigold, colors.rani]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[box, styles.center]}>
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.sand },
  center: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.bodyBold, color: '#fff' },
});
