import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  backLabel?: string;
  onBack?: () => void;
};

export default function ScreenHeader({ eyebrow, title, subtitle, backLabel, onBack }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topbar, { paddingTop: insets.top + 16 }]}>
      {onBack ? (
        <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
          <Text style={styles.backBtnText}>‹ {backLabel ?? 'Terug'}</Text>
        </Pressable>
      ) : null}
      <View style={styles.row}>
        <View style={styles.textColumn}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Image
          source={require('@/assets/images/logo-mark.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    backgroundColor: colors.ink,
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ivory,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textColumn: {
    flex: 1,
    paddingRight: 12,
  },
  logo: {
    width: 96,
    height: 70,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.marigold,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ivory,
    marginTop: 4,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#CFE0D4',
  },
});
