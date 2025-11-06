# República Fácil - Frontend

Frontend da aplicação República Fácil, desenvolvido em React com Vite.

## 🚀 Tecnologias

- React 18
- Vite
- React Router DOM
- Axios
- Font Awesome

## 📦 Instalação

```bash
npm install
```

## 🏃‍♂️ Executar

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🔧 Configuração

O backend deve estar rodando em `http://localhost:8000`

## 📄 Páginas

### Públicas
- `/` - Landing Page (redireciona para dashboard se autenticado)
- `/login` - Página de Login (redireciona para dashboard se autenticado)
- `/register` - Página de Registro (redireciona para dashboard se autenticado)
- `/forgot-password` - Recuperação de Senha (3 passos: email, código, nova senha)

### Protegidas (requer autenticação)
- `/dashboard` - Dashboard principal (redireciona para login se não autenticado)

## 🔐 Sistema de Autenticação

### Armazenamento de Token
O token de acesso é armazenado no `localStorage`:
- `access_token`: Token JWT do backend
- `token_type`: Tipo do token (Bearer)

### Proteção de Rotas
- **PublicRoute**: Rotas que redirecionam para `/dashboard` se já estiver autenticado
- **PrivateRoute**: Rotas que redirecionam para `/login` se não estiver autenticado

### Interceptors Axios
- Adiciona automaticamente o token em todas as requisições
- Redireciona para login se receber erro 401 (não autorizado)

## 🎨 Estrutura

```
src/
├── pages/
│   ├── LandingPage.jsx
│   ├── LandingPage.css
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── Dashboard.jsx
│   ├── Dashboard.css
│   └── Auth.css
├── utils/
│   └── auth.jsx          # Hooks e componentes de autenticação
├── services/
│   └── api.js            # Configuração do Axios com interceptors
├── App.jsx
├── main.jsx
└── index.css
```

## 🔑 Fluxo de Autenticação

1. **Login**: Email + Senha → Token armazenado → Redireciona para dashboard
2. **Registro**: Dados do usuário → Token armazenado → Redireciona para dashboard
3. **Recuperação de Senha**:
   - Passo 1: Email → Código enviado
   - Passo 2: Código → Token temporário
   - Passo 3: Nova senha → Redireciona para login
4. **Logout**: Remove token → Redireciona para login
