# República Fácil - Frontend

Frontend da aplicação República Fácil, desenvolvido em React com Vite.

## Tecnologias

- React 18.3.1
- Vite 5.4.10
- React Router DOM 6.28.0
- Axios 1.7.7
- Font Awesome

## Instalação

```bash
npm install
```

## Executar o Projeto

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

**Nota:** O backend deve estar rodando em `http://localhost:8000`

## Estrutura do Projeto

```
src/
├── components/
│   └── Dashboard/
│       ├── DashboardContent.jsx
│       ├── ExpensesSection.jsx
│       ├── PaymentsSection.jsx
│       ├── ReportsSection.jsx
│       └── index.js
├── pages/
│   ├── LandingPage.jsx
│   ├── LandingPage.css
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── Dashboard.jsx
│   ├── Dashboard.css
│   └── Auth.css
├── services/
│   └── api.js
├── utils/
│   └── auth.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Rotas

### Públicas
- `/` - Landing Page
- `/login` - Página de Login
- `/register` - Página de Registro
- `/forgot-password` - Recuperação de Senha

### Protegidas
- `/dashboard` - Dashboard Principal

## Funcionalidades

### Autenticação
- Login com email e senha
- Registro de novos usuários
- Recuperação de senha (3 etapas)
- Logout

### Dashboard
- Gestão de Despesas (criar, visualizar, filtrar, pagar)
- Controle de Pagamentos
- Relatórios Financeiros
- Exportação de dados em CSV

## Testes Automatizados

Testes E2E usando Selenium WebDriver para validar os principais fluxos da aplicação.

### Instalação

```bash
pip install selenium webdriver-manager
```

### Executar Testes

```bash
# Teste completo (cadastro, república, quarto, membro, despesa, pagamento, CSV)
python3 test/test_selenium.py

# Teste de login e autenticação
python3 test/test_login_selenium.py
```

**Importante:** O servidor deve estar rodando em `http://127.0.0.1:3000` antes de executar os testes.

