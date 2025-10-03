import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Linking,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { useAuth } from '@/providers/AuthProvider';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors } from '@/constants/theme';



export default function AuthScreen() {
  const { signIn, isLoading } = useAuth();

  // lê issuer do app.json e extrai host p/ mostrar no rodapé
  const issuer: string =
    (Constants.expoConfig?.extra as any)?.keycloakIssuer ??
    ((Constants as any).manifest?.extra as any)?.keycloakIssuer ??
    '';
  const issuerHost = useMemo(() => {
    try {
      return issuer ? new URL(issuer).host : '—';
    } catch {
      return '—';
    }
  }, [issuer]);

  // animações: entrada + flutuação do ícone
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(16)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(translate, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -4, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(bob, { toValue: 0, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    ).start();
  }, [fade, translate, bob]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Stack.Screen options={{ title: 'Login' }} />

      {/* Gradiente de topo */}
      <LinearGradient
        colors={['#eaf1ff', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />

      {/* Hero */}
      <Animated.View style={[styles.hero, { opacity: fade, transform: [{ translateY: translate }] }]}>
        <Animated.View style={[styles.iconWrap, { transform: [{ translateY: bob }] }]} accessibilityLabel="Ícone do aplicativo">
          <Ionicons name="cube-outline" size={28} color="#111827" />
        </Animated.View>
        <Text style={styles.title}>Estoque Mobile</Text>
        <Text style={styles.subtitle}>
          Gerencie seus produtos, estoque e relatórios de forma simples e rápida.
        </Text>
      </Animated.View>

      {/* Card central com blur (glass) */}
      <Animated.View style={[styles.cardShadow, { opacity: fade, transform: [{ translateY: translate }] }]}>
        <BlurView intensity={35} tint="light" style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={styles.cardHeaderText}>Autenticação segura</Text>
          </View>

          <Text style={styles.desc}>
            Faça login para continuar. Usamos Keycloak com PKCE para manter sua sessão segura.
          </Text>

          <PrimaryButton
            title={isLoading ? 'Abrindo...' : 'Entrar com Keycloak'}
            onPress={signIn}
            disabled={isLoading}
            accessibilityLabel="Entrar com Keycloak"
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          />

          {isLoading ? (
            <View style={styles.loadingWrap} accessible accessibilityLabel="Carregando">
              <ActivityIndicator />
              <Text style={styles.loadingText}>Inicializando autenticação…</Text>
            </View>
          ) : null}

          {/* links úteis */}
          <View style={styles.linksRow}>
            <Text style={styles.link} onPress={() => Linking.openURL('https://www.keycloak.org/')}>
              O que é Keycloak?
            </Text>
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL(
                  Platform.select({
                    ios: 'https://docs.expo.dev/guides/authentication/#redirect-urls',
                    android: 'https://docs.expo.dev/guides/authentication/#redirect-urls',
                    default: 'https://docs.expo.dev/guides/authentication/#redirect-urls',
                  })!
                )
              }
            >
              Ajuda do login
            </Text>
          </View>
        </BlurView>
      </Animated.View>

      {/* Rodapé / ambiente */}
      <View style={styles.footer}>
        <View style={styles.badge}>
          <Ionicons name="cloud-outline" size={14} color="#2563eb" />
          <Text style={styles.badgeText}>{issuerHost}</Text>
        </View>
        <Text style={styles.footerMuted}>
          Dica: no Expo Go, o redirecionamento usa o <Text style={{ fontWeight: '700', color: '#111827' }}>auth.expo.dev</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: 240,
  },
  hero: {
    paddingTop: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    height: 56,
    width: 56,
    borderRadius: 14,
    backgroundColor: '#E6F0FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  cardShadow: {
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: CARD_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.7)',
    padding: 16,
    gap: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  cardHeaderText: {
    fontWeight: '700',
    color: '#111827',
  },
  desc: {
    color: '#6b7280',
    marginBottom: 4,
  },

  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  loadingText: {
    color: '#6b7280',
  },

  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },

  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  badgeText: { color: '#1e40af', fontWeight: '700' },
  footerMuted: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
});

