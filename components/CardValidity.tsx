import { StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { cardValidity } from '@/data/users';

type Props = {
  validUntil: string | null;
  today: string;
  // On the dark green strip card (Profiel, Mijn lessen).
  dark?: boolean;
  style?: StyleProp<TextStyle>;
};

// "Geldig t/m 8 maart 2027", or the label "Vervallen" once the 4 months have passed.
export default function CardValidity({ validUntil, today, dark, style }: Props) {
  const v = cardValidity(validUntil, today);
  if (!v) return null;
  return (
    <Text
      style={[
        styles.pill,
        v.expired ? styles.expired : dark ? styles.validDark : styles.valid,
        style,
      ]}>
      {v.expired ? `Vervallen · was geldig t/m ${v.date}` : `Geldig t/m ${v.date}`}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 3,
    paddingHorizontal: 9,
    marginTop: 6,
  },
  valid: {
    backgroundColor: '#EAF3EE',
    color: colors.teal,
  },
  validDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#DCEBDF',
  },
  expired: {
    backgroundColor: '#FBE7EE',
    color: colors.rani,
  },
});
