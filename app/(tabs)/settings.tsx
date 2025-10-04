import { Stack } from 'expo-router';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import LogoutButton from '@/components/ui/LogoutButton';
import { colors, spacing, radius } from '@/constants/theme';

export default function Settings() {
  const version =
    (Constants?.expoConfig as any)?.version ??
    (Constants as any)?.manifest2?.version ??
    '—';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Configurações</Text>
          <Text style={styles.pageSubtitle}>Gerencie sua conta e o aplicativo</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Conta</Text>
          <View style={styles.divider} />
          <LogoutButton />
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Sobre</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Versão</Text>
            <Text style={styles.rowValue}>{version}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20, gap: spacing },
  pageHeader: { marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  pageSubtitle: { color: '#6b7280', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: spacing * 1.1,
    gap: spacing * 0.75,
  },
  kicker: { color: '#6b7280', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#e5e7eb' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { color: '#6b7280' },
  rowValue: { fontWeight: '700' },
});
