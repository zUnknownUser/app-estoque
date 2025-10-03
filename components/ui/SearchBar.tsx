import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { colors, radius, spacing } from '@/constants/theme';

export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Buscar produtos...',
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        value={text}
        onChangeText={(t) => {
          setText(t);
          onChange(t);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing,
    paddingHorizontal: spacing,
    paddingVertical: 8,
    gap: 8,
  },
  icon: { opacity: 0.7 },
  input: { flex: 1, color: colors.text },
});
