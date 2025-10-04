import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import SearchBar from '@/components/ui/SearchBar';
import StatsRow from '@/components/ui/StatsRow';
import ProductCard from '@/components/ui/ProductCard';
import { colors } from '@/constants/theme';
import { useProducts } from '@/store/products';
import { LOW_STOCK_THRESHOLD } from '@/constants/inventory';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, fetch, loading } = useProducts();
  const [q, setQ] = useState('');

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    const t = setTimeout(() => fetch(q), 250);
    return () => clearTimeout(t);
  }, [q, fetch]);

  const { totalProducts, totalUnits, lowCount } = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const lowCount = products.filter((p) => (p.quantity || 0) < LOW_STOCK_THRESHOLD).length;
    return { totalProducts, totalUnits, lowCount };
  }, [products]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Estoque</Text>
        </View>

        <View style={styles.searchWrap}>
          <SearchBar value={q} onChange={setQ} />
        </View>

        <View style={styles.statsWrap}>
          <StatsRow totalProducts={totalProducts} totalUnits={totalUnits} lowCount={lowCount} />
        </View>

        {products.length === 0 && !loading ? (
          <Text style={styles.empty}>Nenhum produto. Toque em “+” para adicionar.</Text>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            data={products}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 6 }}>
                <ProductCard
                  item={item}
                  onPress={() =>
                    router.push({ pathname: '/product/[id]', params: { id: item.id } })
                  }
                />
              </View>
            )}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetch(q)} />}
          />
        )}

        <Pressable
          onPress={() => router.push('/create')}
          style={({ pressed }) => [
            styles.fab,
            { bottom: 28 + insets.bottom },
            pressed && { opacity: 0.9 },
          ]}
          accessibilityLabel="Cadastrar novo produto"
        >
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20 },
  pageHeader: { marginBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  searchWrap: { marginBottom: 10 },
  statsWrap: { marginBottom: 8 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 20 },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30, marginTop: -2 },
});
