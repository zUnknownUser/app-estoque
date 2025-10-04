import { Stack, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from 'nanoid/non-secure';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import LabeledInput from '@/components/ui/LabeledInput';
import CurrencyInput from '@/components/ui/CurrencyInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, spacing } from '@/constants/theme';
import { MAX_DESC, MAX_NAME, ProductForm, productSchema } from '@/types/productSchema';
import { useProducts } from '@/store/products';
import { Product } from '@/types/product';

const DEFAULT_VALUES: ProductForm = { name: '', description: '', price: 0, quantity: 0 };

export default function CreateProduct() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { add } = useProducts();

  const { control, handleSubmit, formState, reset } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const onSubmit = async (data: ProductForm) => {
    const now = Date.now();
    const prod: Product = {
      id: nanoid(),
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      price: Number(data.price),
      quantity: Number(data.quantity),
      createdAt: now,
      updatedAt: now,
    };
    try {
      await add(prod);
      reset(DEFAULT_VALUES);
      router.replace('/(tabs)/products');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      reset(DEFAULT_VALUES);
    }, [reset])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.container, { paddingBottom: spacing + insets.bottom }]}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Cadastrar produto</Text>
        </View>

        <LabeledInput control={control} name="name" label="Nome do Produto *" maxLength={MAX_NAME} />
        <LabeledInput
          control={control}
          name="description"
          label="Descrição (opcional)"
          maxLength={MAX_DESC}
          multiline
        />
        <CurrencyInput control={control} name="price" label="Preço *" />
        <LabeledInput
          control={control}
          name="quantity"
          label="Quantidade em Estoque *"
          keyboardType="number-pad"
        />
        <PrimaryButton
          title="Cadastrar Produto"
          onPress={handleSubmit(onSubmit)}
          disabled={!formState.isValid}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.bg, paddingTop: 24, paddingHorizontal: 20, gap: spacing, flexGrow: 1 },
  pageHeader: { marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: '800' },
});
