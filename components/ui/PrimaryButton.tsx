// @/components/ui/PrimaryButton.tsx
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import type { PressableStateCallbackType } from 'react-native';

type Props = Omit<PressableProps, 'onPress' | 'children'> & {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
};

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  style, // pode ser objeto/array OU função(state) => style
  accessibilityLabel,
  variant = 'primary',
  ...rest
}: Props) {
  const bg =
    variant === 'danger'
      ? '#ef4444'
      : variant === 'secondary'
      ? '#111827'
      : colors.primary;

  const composedStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const base = [
      styles.btn,
      { backgroundColor: bg } as ViewStyle,
      (state.pressed || disabled) ? ({ opacity: 0.85 } as ViewStyle) : null,
      disabled ? ({ backgroundColor: '#9ab5f7' } as ViewStyle) : null,
    ];

    // se "style" veio como função, executa; senão aplica direto
    if (typeof style === 'function') {
      const result = style(state) as StyleProp<ViewStyle>;
      return [...base, result];
    }
    return [...base, style as StyleProp<ViewStyle>];
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={composedStyle}
      {...rest}
    >
      <Text style={styles.txt}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing,
  },
  txt: { color: '#fff', fontWeight: '700' },
});
