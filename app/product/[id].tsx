import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View, StyleSheet, Text, Button } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LabeledInput from '@/components/ui/LabeledInput';
import CurrencyInput from '@/components/ui/CurrencyInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import StatusPill from '@/components/ui/StatusPill';

import { colors, spacing } from '@/constants/theme';
import { LOW_STOCK_THRESHOLD } from '@/constants/inventory';

import { useProducts } from '@/store/products';
import { Product } from '@/types/product';
import { productSchema, ProductForm, MAX_DESC, MAX_NAME } from '@/types/productSchema';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fetchById, save, changeStock, remove } = useProducts();

  const { control, handleSubmit, reset, formState } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', price: 0, quantity: 0 },
    mode: 'onChange',
  });

  const [original, setOriginal] = useState<Product | null>(null);
  const qty = original?.quantity ?? 0;
  const low = qty < LOW_STOCK_THRESHOLD;

  // carrega dados do produto
  useEffect(() => {
    (async () => {
      if (!id) return;
      const p = await fetchById(id);
      if (!p) {
       Alert.alert('Atenção', 'Produto não encontrado.', [
  { text: 'OK', onPress: () => router.replace({ pathname: '/(tabs)/products' }) },
]);
        return;
      }
      setOriginal(p);
      reset({
        name: p.name,
        description: p.description ?? '',
        price: p.price,
        quantity: p.quantity,
      });
    })();
  }, [id, fetchById, reset, router]);

  // salva alterações de nome/descrição/preço
  const onSave = async (data: ProductForm) => {
    if (!original) return;
    const updated: Product = {
      ...original,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      price: Number(data.price),
      // quantidade é gerenciada pelos botões (-1/+1)
      updatedAt: Date.now(),
    };
    try {
      await save(updated);
      Alert.alert('Pronto', 'Produto atualizado.');
      const fresh = await fetchById(original.id);
      if (fresh) setOriginal(fresh);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar as alterações.');
    }
  };

  // ajuste de estoque (repositório garante não negativo)
  const dec = async () => {
    if (!original) return;
    const upd = await changeStock(original.id, -1);
    if (upd) setOriginal(upd);
  };
  const inc = async () => {
    if (!original) return;
    const upd = await changeStock(original.id, +1);
    if (upd) setOriginal(upd);
  };

  const onDelete = () => {
    if (!original) return;
    Alert.alert('Excluir', 'Remover este produto do estoque?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await remove(original.id);
          router.replace({ pathname: '/(tabs)/products' });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: original?.name ?? 'Produto' }} />

      <LabeledInput control={control} name="name" label="Nome *" maxLength={MAX_NAME} />
      <LabeledInput
        control={control}
        name="description"
        label="Descrição"
        maxLength={MAX_DESC}
        multiline
      />
      <CurrencyInput control={control} name="price" label="Preço *" />

      {/* Estoque atual + status */}
      <View style={styles.stockRow}>
        <Text style={styles.stockLabel}>
          Estoque atual: <Text style={styles.stockQty}>{qty}</Text>
        </Text>
        <StatusPill mode={low ? 'low' : 'normal'} />
      </View>

      {/* Ajuste rápido */}
      <View style={styles.adjustRow}>
        <Button title="-1" onPress={dec} disabled={qty <= 0} />
        <Button title="+1" onPress={inc} />
      </View>

      <PrimaryButton
        title="Salvar alterações"
        onPress={handleSubmit(onSave)}
        disabled={!formState.isValid}
      />

      <View style={{ height: 24 }} />
      <Button title="Excluir produto" color={colors.danger} onPress={onDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing, gap: spacing },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stockLabel: { fontWeight: '700', color: colors.text },
  stockQty: { color: colors.text },
  adjustRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
});
