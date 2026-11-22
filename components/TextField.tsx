import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
};

// Eye icon for the password toggle: open when the password is visible, struck through when hidden.
function EyeIcon({ open }: { open: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.mutedText} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <Circle cx={12} cy={12} r={3} />
      {open ? null : <Path d="M3 3l18 18" />}
    </Svg>
  );
}

// A labelled input. Password fields (secureTextEntry) get an eye to show what you type.
export default function TextField({ label, style, secureTextEntry, ...inputProps }: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[styles.input, secureTextEntry && styles.inputWithEye, style]}
          placeholderTextColor="#9DAFA2"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secureTextEntry && !visible}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable
            style={styles.eye}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}>
            <EyeIcon open={visible} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  inputWithEye: {
    paddingRight: 50,
  },
  eye: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
