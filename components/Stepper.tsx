import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type StepperProps = {
  value: string | number;
  onChange: (delta: number) => void;
  size?: 'sm' | 'md';
};

// Round – / + buttons around a value, as used on the capacity editors.
export default function Stepper({ value, onChange, size = 'sm' }: StepperProps) {
  const md = size === 'md';
  return (
    <View style={[styles.stepper, md && styles.stepperMd]}>
      <Pressable style={[styles.btn, md && styles.btnMd]} onPress={() => onChange(-1)} hitSlop={8}>
        <Text style={[styles.btnText, md && styles.btnTextMd]}>–</Text>
      </Pressable>
      <Text style={[styles.value, md && styles.valueMd]}>{value}</Text>
      <Pressable style={[styles.btn, md && styles.btnMd]} onPress={() => onChange(1)} hitSlop={8}>
        <Text style={[styles.btnText, md && styles.btnTextMd]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperMd: {
    gap: 12,
  },
  btn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMd: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ivory,
    lineHeight: 18,
  },
  btnTextMd: {
    fontSize: 18,
    lineHeight: 20,
  },
  value: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
    minWidth: 28,
    textAlign: 'center',
  },
  valueMd: {
    fontFamily: fonts.display,
    fontSize: 18,
    minWidth: 20,
  },
});
