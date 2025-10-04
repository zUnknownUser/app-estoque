import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius } from '@/constants/theme';
import { useProducts } from '@/store/products';
import { LOW_STOCK_THRESHOLD } from '@/constants/inventory';

const safeNum = (v: unknown, fallback = 0) =>
  Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : fallback;

const useCurrency = (locale = 'pt-BR', currency = 'BRL') =>
  useMemo(() => new Intl.NumberFormat(locale, { style: 'currency', currency }), [locale, currency]);

const useCompactNumber = (locale = 'pt-BR') =>
  useMemo(() => new Intl.NumberFormat(locale, { notation: 'compact' }), [locale]);

function useInventoryMetrics(products: Array<{ price?: number; quantity?: number }>) {
  return useMemo(() => {
    const totalProducts = products.length;

    let totalUnits = 0;
    let inventoryValue = 0;
    let sumPrice = 0;
    let lowCount = 0;

    for (const p of products) {
      const q = safeNum(p?.quantity);
      const price = safeNum(p?.price);

      totalUnits += q;
      inventoryValue += price * q;
      sumPrice += price;
      if (q < safeNum(LOW_STOCK_THRESHOLD, 0)) lowCount += 1;
    }

    const avgPrice = totalProducts ? sumPrice / totalProducts : 0;

    return { totalProducts, totalUnits, lowCount, inventoryValue, avgPrice };
  }, [products]);
}

const MetricRow = ({
  label,
  value,
  testID,
}: {
  label: string;
  value: string | number;
  testID?: string;
}) => (
  <View
    style={styles.row}
    accessibilityRole="text"
    accessibilityLabel={`${label}: ${value}`}
    testID={testID}
  >
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default function Reports() {
  const { products, fetch }: any = useProducts();
  const [localStatus, setLocalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [localError, setLocalError] = useState<string | null>(null);

  const formatterBRL = useCurrency();
  const formatterCompact = useCompactNumber();

  const doFetch = useCallback(async () => {
    try {
      setLocalStatus('loading');
      setLocalError(null);
      await fetch();
      setLocalStatus('success');
    } catch (e: any) {
      setLocalStatus('error');
      setLocalError(e?.message ?? 'Falha ao atualizar os dados.');
    }
  }, [fetch]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  const metrics = useInventoryMetrics(products ?? []);

  const renderBody = () => {
    if (localStatus === 'loading' && (!products || products.length === 0)) {
      return (
        <View style={styles.center} accessibilityLabel="Carregando métricas">
          <ActivityIndicator />
          <Text style={styles.muted}>Carregando…</Text>
        </View>
      );
    }

    if (localStatus === 'error' && (!products || products.length === 0)) {
      return (
        <View style={styles.center} accessibilityLabel="Erro ao carregar métricas">
          <Text style={styles.errorTitle}>Não foi possível carregar os dados</Text>
          <Text style={styles.muted}>{localError}</Text>
          <Text style={styles.retryHint}>Puxe para baixo para tentar novamente.</Text>
        </View>
      );
    }

    if ((products?.length ?? 0) === 0) {
      return (
        <View style={styles.center} accessibilityLabel="Sem produtos">
          <Text style={styles.emptyTitle}>Nenhum produto cadastrado ainda</Text>
          <Text style={styles.muted}>
            Adicione produtos para ver os relatórios de estoque aqui.
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.card} accessibilityRole="summary" accessibilityLabel="Resumo de métricas de estoque">
          <MetricRow
            label="Produtos cadastrados"
            value={formatterCompact.format(metrics.totalProducts)}
            testID="metric-total-products"
          />
          <MetricRow
            label="Unidades em estoque"
            value={formatterCompact.format(metrics.totalUnits)}
            testID="metric-total-units"
          />
          <MetricRow
            label="Itens com estoque baixo"
            value={formatterCompact.format(metrics.lowCount)}
            testID="metric-low-count"
          />
          <MetricRow
            label="Valor total em estoque"
            value={formatterBRL.format(metrics.inventoryValue)}
            testID="metric-inventory-value"
          />
          <MetricRow
            label="Preço médio dos produtos"
            value={formatterBRL.format(metrics.avgPrice)}
            testID="metric-avg-price"
          />
        </View>

        <Text style={styles.note} accessibilityHint="Observação sobre origem dos dados">
          * Todas as métricas são calculadas localmente com base nos dados salvos no dispositivo.
        </Text>
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Relatórios',
          headerLargeTitle: true,
        }}
      />
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={localStatus === 'loading'} onRefresh={doFetch} />}
        testID="reports-scroll"
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Relatórios</Text>
        </View>
        {renderBody()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20 },
  pageHeader: { marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#6b7280' },
  value: { fontWeight: '700' },
  note: { color: '#9ca3af', fontSize: 12, marginTop: 8 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: 8 },
  muted: { color: '#6b7280', textAlign: 'center' },
  errorTitle: { fontWeight: '700', marginBottom: 4 },
  retryHint: { color: '#6b7280', fontSize: 12, marginTop: 8 },
  emptyTitle: { fontWeight: '700', marginBottom: 4 },
});
