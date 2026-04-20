# Espaço dos Óculos PB

Site institucional e catálogo de produtos para a ótica Espaço dos Óculos em João Pessoa - PB.

## 🚀 Como Hospedar em sua VPS

Este projeto foi construído com **React + Vite + Firebase**. Para hospedar em um servidor próprio (VPS), siga os passos abaixo:

### 1. Pré-requisitos
- Node.js instalado (v18 ou superior).
- Um projeto no Firebase com Auth (Google Login) e Firestore ativados.

### 2. Configuração do Firebase
Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base) e preencha com as credenciais do seu projeto Firebase:

```env
VITE_FIREBASE_API_KEY="seu_api_key"
VITE_FIREBASE_AUTH_DOMAIN="seu_projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu_projeto_id"
VITE_FIREBASE_STORAGE_BUCKET="seu_projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu_sender_id"
VITE_FIREBASE_APP_ID="seu_app_id"
VITE_META_PIXEL_ID="1410597223535332"
```

### 3. Instalação e Build
No terminal da sua VPS:

```bash
# Instalar dependências
npm install

# Gerar a versão de produção
npm run build
```

### 4. Servir os arquivos
Os arquivos prontos estarão na pasta `dist/`. Você pode usar o **Nginx** ou o **Apache** para servir essa pasta como um site estático.

Exemplo simples com Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;
    root /caminho/para/o/projeto/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🛠️ Gerenciamento (Admin)
O painel administrativo pode ser acessado fazendo login com a conta Google configurada como administradora no código (`Anndrefrazao@gmail.com`).

- **Caminho**: Role até o final do site e clique em "Acesso Restrito".
- **Funções**: Adicionar, editar e excluir produtos do catálogo em tempo real.

---
Desenvolvido com carinho para o Espaço dos Óculos.
