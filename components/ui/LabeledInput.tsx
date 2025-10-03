import { Controller, Control } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export default function LabeledInput({
  control,
  name,
  label,
  maxLength,
  keyboardType,
  multiline,
}: {
  control: Control<any>;
  name: string;
  label: string;
  maxLength?: number;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  multiline?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        const length = (value?.toString() ?? '').length;
        return (
          <View style={{ marginBottom: spacing }}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{label}</Text>
              {maxLength ? (
                <Text style={styles.count}>{length}/{maxLength}</Text>
              ) : null}
            </View>
            <TextInput
              value={value?.toString() ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType={keyboardType}
              multiline={multiline}
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                multiline && { height: 110, textAlignVertical: 'top' },
              ]}
              maxLength={maxLength}
            />
            {error ? <Text style={styles.err}>{error.message}</Text> : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontWeight: '600', color: colors.text },
  count: { color: colors.muted, fontSize: 12 },
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
