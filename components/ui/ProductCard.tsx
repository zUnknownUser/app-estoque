import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Product } from '@/types/product';
import { colors, radius } from '@/constants/theme';
import StatusPill from './StatusPill';
import { LOW_STOCK_THRESHOLD } from '@/constants/inventory';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function ProductCard({ item, onPress }:{ item: Product; onPress?: () => void }) {
  const low = item.quantity < LOW_STOCK_THRESHOLD;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text style={styles.stock}>Estoque: {item.quantity}</Text>
        <StatusPill mode={low ? 'low' : 'normal'} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  name: { fontWeight: '700', fontSize: 15 },
  desc: { color: colors.muted, fontSize: 12 },
  price: { fontWeight: '700', marginTop: 4 },
  stock: { color: colors.muted, fontSize: 12 },
});
