import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

type Tokens = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number; // epoch ms
};

type SignInOpts = { forceReauth?: boolean; selectAccount?: boolean };

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  tokens?: Tokens | null;
  signIn: (opts?: SignInOpts) => Promise<void>;
  signOut: () => Promise<void>;
  refreshIfNeeded: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
  refreshIfNeeded: async () => {},
});

const STORAGE_KEY = 'auth_tokens_v1';

const extra =
  (Constants.expoConfig?.extra as any) ||
  ((Constants as any).manifest?.extra as any) ||
  {};

const rawScheme =
  (Constants.expoConfig as any)?.scheme ??
  ((Constants as any).manifest?.scheme as unknown);
const scheme: string = Array.isArray(rawScheme)
  ? rawScheme[0]
  : (rawScheme as string) || 'estoqueapp';

const issuer =
  (process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER as string) ||
  (extra?.keycloakIssuer as string) ||
  '';
const clientId =
  (process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID as string) ||
  (extra?.keycloakClientId as string) ||
  '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const discovery = AuthSession.useAutoDiscovery(issuer || 'about:blank');

  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw) setTokens(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (t: Tokens | null) => {
    setTokens(t);
    if (t) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(t));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  };

  const signIn = useCallback(
    async (opts?: SignInOpts) => {
      if (!issuer || !clientId) {
        throw new Error(
          'Config de Keycloak ausente: defina keycloakIssuer e keycloakClientId no app.json (ou via EXPO_PUBLIC_*).'
        );
      }
      if (!discovery?.authorizationEndpoint) {
        throw new Error(
          'Discovery inválido. Abra a URL /.well-known/openid-configuration do issuer no navegador e verifique.'
        );
      }

      const redirectUri = AuthSession.makeRedirectUri({ scheme });
      console.log('>>>> URI DE REDIRECIONAMENTO GERADA PELO EXPO:', redirectUri);

      const request = new AuthSession.AuthRequest({
        clientId,
        responseType: AuthSession.ResponseType.Code,
        scopes: ['openid', 'profile', 'email'],
        usePKCE: true,
        redirectUri,
      });

 
      const extraParams: Record<string, string> = {};
      if (opts?.forceReauth) {
        extraParams.prompt = 'login';
        extraParams.max_age = '0';
      } else if (opts?.selectAccount) {
        extraParams.prompt = 'select_account';
      }

   
      await request.makeAuthUrlAsync(discovery);

      const result = await request.promptAsync(discovery);
      if (result.type !== 'success' || !result.params.code) return;

      const { accessToken, refreshToken, idToken, issuedAt, expiresIn } =
        await AuthSession.exchangeCodeAsync(
          {
            code: result.params.code,
            clientId,
            redirectUri,
            extraParams: { code_verifier: request.codeVerifier! },
          },
          discovery
        );

      const expiresAt =
        (issuedAt ?? Math.floor(Date.now() / 1000)) * 1000 +
        (expiresIn ?? 0) * 1000;

      await persist({
        accessToken: accessToken!,
        refreshToken: refreshToken ?? undefined,
        idToken: idToken ?? undefined,
        expiresAt,
      });
    },
    [discovery]
  );

  const refreshIfNeeded = useCallback(async () => {
    if (!discovery?.tokenEndpoint || !tokens?.refreshToken) return;

    const now = Date.now();
    if (tokens.expiresAt && now < tokens.expiresAt - 30_000) return; // 30s de folga

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: tokens.refreshToken,
    });

    const resp = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!resp.ok) {
      await persist(null);
      return;
    }

    const json = await resp.json();
    const expiresAt = Date.now() + Number(json.expires_in ?? 0) * 1000;

    await persist({
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? tokens.refreshToken,
      idToken: json.id_token ?? tokens.idToken,
      expiresAt,
    });
  }, [discovery, tokens]);

 
  const signOut = useCallback(async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({ scheme });

     
      if (discovery?.endSessionEndpoint && tokens?.refreshToken) {
        const body = new URLSearchParams({
          client_id: clientId,
          refresh_token: tokens.refreshToken,
        });
        await fetch(discovery.endSessionEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        }).catch(() => {});
      } else if (issuer && tokens?.refreshToken) {
        await fetch(`${issuer}/protocol/openid-connect/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            refresh_token: tokens.refreshToken,
          }).toString(),
        }).catch(() => {});
      }
    } finally {
      await persist(null); // limpa tokens locais sempre
    }
  }, [discovery?.endSessionEndpoint, issuer, clientId, tokens?.refreshToken]);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: !!tokens?.accessToken,
      tokens,
      signIn,
      signOut,
      refreshIfNeeded,
    }),
    [isLoading, tokens, signIn, signOut, refreshIfNeeded]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
