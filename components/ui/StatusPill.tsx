import { Text, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

export default function StatusPill({ mode = 'normal' }:{ mode: 'normal' | 'low' }) {
  const bg = mode === 'low' ? '#FEF3C7' : '#DCFCE7';
  const fg = mode === 'low' ? colors.warning : colors.success;
  const label = mode === 'low' ? 'Baixo' : 'Normal';
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: fg }]}>
      <Text style={[styles.txt, { color: fg }]}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  txt: { fontSize: 12, fontWeight: '600' },
});
