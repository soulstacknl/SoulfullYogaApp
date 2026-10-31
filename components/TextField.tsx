import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
};

export default function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#9DAFA2"
        autoCapitalize="none"
        autoCorrect={false}
        {...inputProps}
      />
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
});
