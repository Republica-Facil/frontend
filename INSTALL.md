# Instruções de Instalação - República Fácil Frontend

## Problema com WSL
Há um problema conhecido ao executar npm install através do WSL com caminhos UNC.

## Solução

### Opção 1: Usar terminal WSL nativo
1. Abra um terminal WSL diretamente (não através do VS Code)
2. Navegue até o diretório:
   ```bash
   cd /root/republica_facil_frontend
   ```
3. Execute:
   ```bash
   npm install
   ```

### Opção 2: Usar terminal do Windows
1. Abra o PowerShell ou CMD
2. Navegue até o diretório (o caminho pode variar):
   ```cmd
   cd \\wsl.localhost\Ubuntu\root\republica_facil_frontend
   ```
3. Execute:
   ```cmd
   npm install
   ```

### Opção 3: Mover projeto para home directory
1. Mova o projeto para seu diretório home:
   ```bash
   mv /root/republica_facil_frontend ~/republica_facil_frontend
   cd ~/republica_facil_frontend
   npm install
   ```

## Executar o projeto

Após a instalação bem-sucedida:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## Verificar instalação

Após executar npm install, você deve ver a pasta `node_modules` criada com as dependências.
