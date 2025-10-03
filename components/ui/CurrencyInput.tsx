import { Controller, Control } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

const formatBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(n) ? 0 : n);

// aceita apenas dígitos, divide por 100 para ter centavos
const toNumberFromDigits = (t: string) => {
  const digits = (t || '').replace(/\D/g, '');
  const asNumber = Number(digits) / 100;
  return asNumber;
};

export default function CurrencyInput({
  control,
  name,
  label,
}: {
  control: Control<any>;
  name: string;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={{ marginBottom: spacing }}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={formatBRL(Number(value ?? 0))}
            onChangeText={(t) => onChange(toNumberFromDigits(t))}
            keyboardType="number-pad"
            style={styles.input}
          />
          {error ? <Text style={styles.err}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 12,
    color: colors.text,
  },
  err: { color: colors.danger, marginTop: 4, fontSize: 12 },
});
