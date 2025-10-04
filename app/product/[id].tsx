import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Alert, View, StyleSheet, Text, Button, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import LabeledInput from '@/components/ui/LabeledInput'
import CurrencyInput from '@/components/ui/CurrencyInput'
import PrimaryButton from '@/components/ui/PrimaryButton'
import StatusPill from '@/components/ui/StatusPill'
import { colors, spacing } from '@/constants/theme'
import { LOW_STOCK_THRESHOLD } from '@/constants/inventory'
import { useProducts } from '@/store/products'
import { Product } from '@/types/product'
import { productSchema, ProductForm, MAX_DESC, MAX_NAME } from '@/types/productSchema'

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { fetchById, save, changeStock, remove } = useProducts()

  const { control, handleSubmit, reset, formState, watch } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', price: 0, quantity: 0 },
    mode: 'onChange',
  })

  const [original, setOriginal] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stockBusy, setStockBusy] = useState(false)

  const qty = original?.quantity ?? 0
  const low = qty < LOW_STOCK_THRESHOLD

  const watched = watch()
  const hasChanges = useMemo(() => {
    if (!original) return false
    return (
      watched.name?.trim() !== original.name ||
      (watched.description?.trim() || '') !== (original.description || '') ||
      Number(watched.price) !== Number(original.price)
    )
  }, [watched, original])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!id) {
        Alert.alert('Atenção', 'Produto não encontrado.', [
          { text: 'OK', onPress: () => router.replace({ pathname: '/(tabs)/products' }) },
        ])
        return
      }
      try {
        const p = await fetchById(id)
        if (!p) {
          Alert.alert('Atenção', 'Produto não encontrado.', [
            { text: 'OK', onPress: () => router.replace({ pathname: '/(tabs)/products' }) },
          ])
          return
        }
        if (!mounted) return
        setOriginal(p)
        reset({
          name: p.name,
          description: p.description ?? '',
          price: p.price,
          quantity: p.quantity,
        })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id, fetchById, reset, router])

  const onSave = async (data: ProductForm) => {
    if (!original || saving) return
    setSaving(true)
    const updated: Product = {
      ...original,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      price: Number(data.price),
      updatedAt: Date.now(),
    }
    try {
      await save(updated)
      const fresh = await fetchById(original.id)
      if (fresh) {
        setOriginal(fresh)
        reset({
          name: fresh.name,
          description: fresh.description ?? '',
          price: fresh.price,
          quantity: fresh.quantity,
        })
      }
      Alert.alert('Pronto', 'Produto atualizado.')
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

  const dec = async () => {
    if (!original || stockBusy || qty <= 0) return
    setStockBusy(true)
    try {
      const upd = await changeStock(original.id, -1)
      if (upd) setOriginal(upd)
    } finally {
      setStockBusy(false)
    }
  }

  const inc = async () => {
    if (!original || stockBusy) return
    setStockBusy(true)
    try {
      const upd = await changeStock(original.id, +1)
      if (upd) setOriginal(upd)
    } finally {
      setStockBusy(false)
    }
  }

  const onDelete = () => {
    if (!original) return
    Alert.alert(
      'Excluir',
      `Remover "${original.name}" do estoque?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await remove(original.id)
            router.replace({ pathname: '/(tabs)/products' })
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: original?.name ?? 'Produto' }} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing }}>
          <LabeledInput control={control} name="name" label="Nome *" maxLength={MAX_NAME} />
          <LabeledInput control={control} name="description" label="Descrição" maxLength={MAX_DESC} multiline />
          <CurrencyInput control={control} name="price" label="Preço *" />
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>
              Estoque atual: <Text style={styles.stockQty}>{qty}</Text>
            </Text>
            <StatusPill mode={low ? 'low' : 'normal'} />
          </View>
          <View style={styles.adjustRow}>
            <Button title="-1" onPress={dec} disabled={qty <= 0 || stockBusy} />
            <Button title="+1" onPress={inc} disabled={stockBusy} />
          </View>
          <PrimaryButton
            title={saving ? 'Salvando...' : 'Salvar alterações'}
            onPress={handleSubmit(onSave)}
            disabled={!formState.isValid || !hasChanges || saving}
          />
          <View style={{ height: 24 }} />
          <Button title="Excluir produto" color={colors.danger} onPress={onDelete} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing, gap: spacing },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  stockLabel: { fontWeight: '700', color: colors.text },
  stockQty: { color: colors.text },
  adjustRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
})
