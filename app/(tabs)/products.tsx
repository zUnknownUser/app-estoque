import { Stack, useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import SearchBar from '@/components/ui/SearchBar';
import ProductCard from '@/components/ui/ProductCard';
import { colors } from '@/constants/theme';
import { useProducts } from '@/store/products';

type Filter = 'all' | 'active' | 'archived';
type SortKey = 'name' | 'priceAsc' | 'priceDesc' | 'recent';

export default function ProductsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, fetch, loading } = useProducts();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('name');

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    const t = setTimeout(() => fetch(q), 250);
    return () => clearTimeout(t);
  }, [q, fetch]);

  const data = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = (products ?? []).filter((p) => {
      const matches = term.length === 0 || p.name.toLowerCase().includes(term);
      const archived = Boolean((p as any).archived);
      const byFilter = filter === 'all' ? true : filter === 'archived' ? archived : !archived;
      return matches && byFilter;
    });

    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
    switch (sort) {
      case 'name':
        list.sort((a, b) => collator.compare(a.name, b.name));
        break;
      case 'priceAsc':
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'priceDesc':
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'recent':
        list.sort(
          (a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0)
        );
        break;
    }
    return list;
  }, [products, q, filter, sort]);

  const sortLabel = useMemo(() => {
    switch (sort) {
      case 'name':
        return 'Nome';
      case 'priceAsc':
        return 'Preço ↑';
      case 'priceDesc':
        return 'Preço ↓';
      case 'recent':
        return 'Recentes';
    }
  }, [sort]);

  const cycleSort = () => {
    setSort((prev) =>
      prev === 'name'
        ? 'priceAsc'
        : prev === 'priceAsc'
        ? 'priceDesc'
        : prev === 'priceDesc'
        ? 'recent'
        : 'name'
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Produtos</Text>
        </View>

        <View style={styles.searchWrap}>
          <SearchBar value={q} onChange={setQ} />
        </View>

        <View style={styles.toolbar}>
          <View style={styles.filters}>
            <Pressable
              onPress={() => setFilter('all')}
              style={[styles.chip, filter === 'all' && styles.chipActive]}
              hitSlop={8}
            >
              <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>Todos</Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter('active')}
              style={[styles.chip, filter === 'active' && styles.chipActive]}
              hitSlop={8}
            >
              <Text style={[styles.chipText, filter === 'active' && styles.chipTextActive]}>Ativos</Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter('archived')}
              style={[styles.chip, filter === 'archived' && styles.chipActive]}
              hitSlop={8}
            >
              <Text style={[styles.chipText, filter === 'archived' && styles.chipTextActive]}>Arquivados</Text>
            </Pressable>
          </View>

          <Pressable onPress={cycleSort} style={styles.sortBtn} hitSlop={8} accessibilityLabel="Alterar ordenação">
            <Text style={styles.sortText}>Ordenar: {sortLabel}</Text>
          </Pressable>
        </View>

        {data.length === 0 && !loading ? (
          <Text style={styles.empty}>Nenhum produto cadastrado. Toque em “+” para criar o primeiro.</Text>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            data={data}
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
            initialNumToRender={12}
            windowSize={5}
            removeClippedSubviews
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  filters: { flexDirection: 'row', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipActive: { borderColor: '#d1d5db' },
  chipText: { color: '#6b7280' },
  chipTextActive: { color: '#111827', fontWeight: '700' },
  sortBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  sortText: { color: '#6b7280', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 20, paddingHorizontal: 16 },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30, marginTop: -2 },
});
