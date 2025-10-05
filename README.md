# Estoque Mobile — README (Curto)

> App **React Native + Expo + TypeScript** para gestão de estoque.  
> Login via **Keycloak (OIDC + PKCE)** hospedado externamente — roda em qualquer máquina.

---

## 1) Visão Geral
- **Expo + expo-router**, **TypeScript**
- **SQLite** (persistência local) • **react-hook-form + zod** (validação)
- **Auth**: Keycloak com **expo-auth-session** (Proxy da Expo) e **SecureStore**
- **Design**: componentes reutilizáveis e UX consistente

---

## 2) Como Rodar
```bash
npm install
npx expo start -c
# depois: a (Android) | i (iOS) | escaneie o QR no Expo Go
Login demo

Usuário: demo
Senha: demo

O login usa auth.expo.dev (Proxy da Expo), então não depende de IP/porta local.

3) Configuração (já no repo)
app.json:

json
{
  "expo": {
    "scheme": "estoqueapp",
    "extra": {
      "keycloakIssuer": "https://SUBDOMINIO.koyeb.app/realms/estoque",
      "keycloakClientId": "app-mobile"
    }
  }
}
Keycloak (client app-mobile)

Public client • Standard Flow ON • PKCE S256

Valid Redirect URIs: https://auth.expo.dev/*

Post Logout Redirect URIs: https://auth.expo.dev/*

Web origins: https://auth.expo.dev

4) Funcionalidades
Cadastrar, listar (busca/ordenação), editar, ajustar estoque (+1/−1) (não-negativo), excluir

Relatórios: totais, itens com estoque baixo, valor total, preço médio

Configurações: versão do app e logout

5) Roteiro de Teste
Login demo/demo

Cadastrar produto

Buscar/ordenar

Editar e ajustar estoque

Conferir Relatórios

Excluir e Logout
