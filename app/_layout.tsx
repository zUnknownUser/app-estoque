// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      console.log('⏳ AuthGate: Ainda carregando...');
      return;
    }

    const currentRoute = segments[0];
    console.log('🔐 AuthGate:', {
      route: currentRoute,
      authenticated: isAuthenticated,
      loading: isLoading
    });

    // Aguarda um pouco para garantir que o estado está estável
    const timer = setTimeout(() => {
      if (!isAuthenticated && currentRoute !== '(auth)') {
        console.log('🚫 Indo para login...');
        router.replace('/(auth)');
      } else if (isAuthenticated && currentRoute === '(auth)') {
        console.log('✅ Indo para app...');
        router.replace('/(tabs)');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, segments[0], router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}