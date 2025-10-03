import { Stack } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius } from '@/constants/theme';
import { useProducts } from '@/store/products';
import { LOW_STOCK_THRESHOLD } from '@/constants/inventory';

const BRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function Reports() {
  const { products, fetch } = useProducts();

  useEffect(() => { fetch(); }, [fetch]);

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const lowCount = products.filter((p) => (p.quantity || 0) < LOW_STOCK_THRESHOLD).length;
    const inventoryValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0);
    const avgPrice = totalProducts
      ? products.reduce((acc, p) => acc + (p.price || 0), 0) / totalProducts
      : 0;
    return { totalProducts, totalUnits, lowCount, inventoryValue, avgPrice };
  }, [products]);

  const Item = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Relatórios' }} />
        <View style={styles.card}>
          <Item label="Produtos cadastrados" value={metrics.totalProducts} />
          <Item label="Unidades em estoque" value={metrics.totalUnits} />
          <Item label="Itens com estoque baixo" value={metrics.lowCount} />
          <Item label="Valor total em estoque" value={BRL(metrics.inventoryValue)} />
          <Item label="Preço médio dos produtos" value={BRL(metrics.avgPrice)} />
        </View>
        <Text style={styles.note}>
          * Todas as métricas são calculadas localmente com base nos dados salvos no dispositivo.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#6b7280' },
  value: { fontWeight: '700' },
  note: { color: '#9ca3af', fontSize: 12, marginTop: 8 },
});
