// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { decode as atob } from 'base-64';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { openDbForUserAsync, resetDbRef } from '@/store/db';

function subFromJwt(token?: string | null): string | null {
  if (!token) return null;
  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return null;
    const norm = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(norm));
    return (json?.sub as string) ?? null;
  } catch {
    return null;
  }
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, tokens } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [dbReady, setDbReady] = useState(false);

  const issuer: string = useMemo(() => {
    const extra =
      (Constants.expoConfig?.extra as any) ||
      ((Constants as any).manifest?.extra as any) ||
      {};
    return (extra.keycloakIssuer as string) || '';
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        resetDbRef();
        if (!cancelled) setDbReady(false);
        return;
      }

      try {
        let sub = subFromJwt(tokens?.idToken) || subFromJwt(tokens?.accessToken);

        if (!sub && issuer) {
          try {
            const r = await fetch(`${issuer}/protocol/openid-connect/userinfo`, {
              headers: { Authorization: `Bearer ${tokens?.accessToken}` },
            });
            const j = await r.json();
            sub = j?.sub;
          } catch {}
        }

        if (!sub) throw new Error('Não foi possível obter o "sub" do usuário.');
        await openDbForUserAsync(sub);
        if (!cancelled) setDbReady(true);
      } catch (e) {
        console.warn('Falha ao abrir DB do usuário:', e);
        if (!cancelled) setDbReady(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isLoading, isAuthenticated, tokens?.accessToken, tokens?.idToken, issuer]);


  useEffect(() => {
    if (isLoading) return;
    const root = (segments[0] as unknown as string) || '';
    const inAuth = root === '(auth)';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)'); 
      return;
    }

    if (isAuthenticated && !dbReady) return;

    if (isAuthenticated && dbReady && inAuth) {
      router.replace('/(tabs)');  
    }
  }, [isLoading, isAuthenticated, dbReady, segments, router]);

  if (isAuthenticated && !dbReady) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </AuthGate>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
