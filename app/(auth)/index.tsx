import { Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { useAuth } from '@/providers/AuthProvider';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors } from '@/constants/theme';

export default function AuthScreen() {
  const { signIn, isLoading } = useAuth();

  const pulse = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeIn, slideUp, pulse]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 0.9] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1220' }} edges={['top']}>
      <Stack.Screen options={{ title: 'Login' }} />

      <LinearGradient
        colors={['#0b1220', '#0b1220']}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(59,130,246,0.30)', 'rgba(139,92,246,0.20)', 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bgAccentTop}
      />
      <LinearGradient
        colors={['rgba(99,102,241,0.25)', 'rgba(16,185,129,0.18)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bgAccentBottom}
      />

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.hero,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <View style={styles.glassRingOuter}>
            <LinearGradient
              colors={['#60a5fa', '#a78bfa', '#34d399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ringGradient}
            >
              <BlurView intensity={40} tint="light" style={styles.ringGlass} />
            </LinearGradient>

            <Animated.View
              style={[
                styles.glow,
                { opacity: glowOpacity, transform: [{ scale: glowScale }] },
              ]}
            />

            <View style={styles.iconBadge}>
              <Ionicons name="cube-outline" size={28} color="#0b1220" />
            </View>
          </View>

          <Text style={styles.title}>Estoque Mobile</Text>
          <Text style={styles.subtitle}>
            Controle, edite e acompanhe seu estoque com praticidade.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardShadow,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.10)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <BlurView intensity={28} tint="light" style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#2563eb" />
                <Text style={styles.cardHeaderText}>Autenticação segura</Text>
              </View>

              <Text style={styles.desc}>
                Faça login para continuar. O fluxo usa Keycloak com PKCE.
              </Text>

              <PrimaryButton
                title={isLoading ? 'Abrindo…' : 'Entrar com Keycloak'}
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

              <View style={styles.linksRow}>
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
          </LinearGradient>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 18;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    justifyContent: 'center',
  },

  bgAccentTop: {
    position: 'absolute',
    top: -140,
    left: -110,
    width: 320,
    height: 320,
    borderRadius: 320,
    opacity: 0.8,
    filter: 'blur(40px)' as any,
  },
  bgAccentBottom: {
    position: 'absolute',
    bottom: -160,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 360,
    opacity: 0.7,
    filter: 'blur(48px)' as any,
  },

  hero: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },

  glassRingOuter: {
    width: 86,
    height: 86,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ringGradient: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    opacity: 0.9,
  },
  ringGlass: {
    position: 'absolute',
    inset: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(99,102,241,0.25)',
    filter: 'blur(24px)' as any,
  },
  iconBadge: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  subtitle: {
    textAlign: 'center',
    color: '#cbd5e1',
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 8,
  },
  cardBorder: {
    borderRadius: CARD_RADIUS,
    padding: 1.2,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.66)',
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
    color: '#0b1220',
  },
  desc: {
    color: '#334155',
    marginBottom: 4,
  },

  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  loadingText: { color: '#475569' },

  linksRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
