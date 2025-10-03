import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export default function StatsRow({
  totalProducts,
  totalUnits,
  lowCount,
}: {
  totalProducts: number;
  totalUnits: number;
  lowCount: number;
}) {
  const Item = ({ title, value, color }: { title: string; value: number | string; color: string }) => (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
  return (
    <View style={styles.row}>
      <Item title="Total" value={totalProducts} color={colors.primary} />
      <Item title="Em Estoque" value={totalUnits} color={colors.success} />
      <Item title="Baixo" value={lowCount} color={colors.warning} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing, paddingHorizontal: spacing, marginTop: spacing },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: radius,
    padding: 12,
    alignItems: 'center',
  },
  value: { fontWeight: '800', fontSize: 18 },
  title: { color: colors.muted, marginTop: 4 },
});
