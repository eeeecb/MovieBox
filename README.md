# 🎬 MovieBox

<div align="center">
  <h3>Seu catálogo digital de filmes favoritos</h3>
  <p>
    <strong>Descubra, explore e organize seus filmes favoritos em um só lugar</strong>
  </p>
  
  ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black)
</div>

---

## 📱 Sobre o Projeto

**MovieBox** é um aplicativo móvel multiplataforma desenvolvido em React Native que oferece uma experiência completa para cinéfilos. Com integração à API do The Movie Database (TMDB), o app permite descobrir filmes em cartaz, pesquisar por títulos específicos, conhecer detalhes de atores e criar uma biblioteca pessoal de favoritos sincronizada na nuvem.

### ✨ Principais Características

- 🎭 **Catálogo Completo**: Acesso a milhares de filmes com informações detalhadas
- 🔍 **Pesquisa Inteligente**: Busca em tempo real com debouncing otimizado
- ⭐ **Sistema de Favoritos**: Lista personalizada sincronizada na nuvem via Firebase
- 👤 **Perfis Completos**: Informações detalhadas de atores e suas filmografias
- 🌙 **Temas Adaptativos**: Suporte a modo claro/escuro com sincronização automática
- 🔐 **Autenticação Segura**: Login e registro com Firebase Authentication
- 📱 **Multiplataforma**: Funciona em iOS, Android e Web
- ☁️ **Sincronização**: Dados persistentes entre dispositivos

---

## 🛠️ Tecnologias Utilizadas

### Core Framework
- **React Native** `^0.73.0` - Framework principal para desenvolvimento mobile
- **Expo** `~50.0.0` - Plataforma de desenvolvimento e build

### Navegação
- **React Navigation** `^6.0.0` - Sistema completo de navegação
  - Stack Navigator (navegação hierárquica)
  - Tab Navigator (navegação por abas)
  - Drawer Navigator (menu lateral)

### Backend e Autenticação
- **Firebase Authentication** - Sistema completo de autenticação
- **Firebase Firestore** - Banco de dados NoSQL para dados do usuário
- **AsyncStorage** - Armazenamento local para cache e preferências

### APIs e Serviços
- **The Movie Database (TMDB) API** - Dados completos sobre filmes e atores
- **Expo Image Picker** - Seleção e manipulação de imagens
- **Expo Image Manipulator** - Processamento e otimização de imagens

### Interface e UX
- **Expo Google Fonts** - Tipografia personalizada
- **Expo Vector Icons** - Conjunto abrangente de ícones
- **React Native Safe Area Context** - Gerenciamento de áreas seguras

---

## 📂 Arquitetura do Projeto

```
moviebox/
├── 📁 assets/                    # Recursos estáticos
│   ├── icon.png                 # Ícone do aplicativo
│   ├── splash-icon.png          # Tela de splash
│   └── adaptive-icon.png        # Ícone adaptativo Android
│
├── 📁 components/               # Componentes reutilizáveis
│   ├── CustomDrawerContent.js   # Menu lateral personalizado
│   ├── ThemePreview.js          # Preview dos temas
│   ├── SimpleDebug.js           # Componente de debug
│   └── Base64ImageDebug.js      # Debug de imagens
│
├── 📁 contexts/                 # Contextos React
│   └── ThemeContext.js          # Gerenciamento global de temas
│
├── 📁 hooks/                    # Hooks personalizados
│   ├── useAuth.js               # Hook de autenticação
│   ├── useFavorites.js          # Hook de favoritos
│   └── useMovies.js             # Hook para dados de filmes
│
├── 📁 navigation/               # Configuração de navegação
│   └── MainNavigator.js         # Navegador principal
│
├── 📁 screens/                  # Telas do aplicativo
│   ├── HomeScreen.js            # Catálogo principal
│   ├── MovieScreen.js           # Detalhes do filme
│   ├── ActorScreen.js           # Perfil do ator
│   ├── FavoritesScreen.js       # Lista de favoritos
│   ├── LoginScreen.js           # Autenticação
│   ├── ProfileScreen.js         # Perfil do usuário
│   └── SettingsScreen.js        # Configurações
│
├── 📁 services/                 # Serviços e APIs
│   ├── tmdbApi.js               # Interface com TMDB API
│   ├── firebaseAuth.js          # Serviços de autenticação
│   ├── firestoreService.js      # Operações do Firestore
│   └── base64ImageService.js    # Processamento de imagens
│
├── 📁 config/                   # Configurações
│   └── debugConfig.js           # Configurações de debug
│
├── 📁 utils/                    # Utilitários
│   └── crossPlatformAlert.js    # Alerts multiplataforma
│
├── firebaseConfig.js            # Configuração do Firebase
├── FirebaseInitializer.js       # Inicializador do Firebase
├── App.js                       # Componente raiz
└── index.js                     # Ponto de entrada
```

---

## 🔧 Configuração e Instalação

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**

### 1. Clone o Repositório

```bash
git clone https://github.com/eeeecb/moviebox.git
cd moviebox
```

### 2. Instale as Dependências

```bash
# Usando npm
npm install

# Ou usando yarn
yarn install
```

### 3. Configuração do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative **Authentication** e **Firestore Database**
4. Configure as regras de segurança do Firestore:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Favoritos por usuário
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

5. Copie as credenciais do Firebase e atualize `firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};
```

### 4. Configuração da TMDB API

1. Registre-se em [The Movie Database](https://www.themoviedb.org/signup)
2. Obtenha sua API Key em [Settings > API](https://www.themoviedb.org/settings/api)
3. Atualize a chave em `services/tmdbApi.js`:

```javascript
const TMDB_API_KEY = "sua-tmdb-api-key";
```

### 5. Execute o Projeto

```bash
# Inicia o servidor de desenvolvimento
expo start

# Para executar em plataformas específicas
expo start --ios        # iOS Simulator
expo start --android    # Android Emulator
expo start --web        # Navegador web
```

---

## 📱 Funcionalidades Detalhadas

### 🏠 Catálogo Principal
- **Filmes em Cartaz**: Títulos atualmente nos cinemas
- **Filmes Populares**: Os mais assistidos do momento
- **Mais Bem Avaliados**: Filmes com melhores críticas
- **Pesquisa em Tempo Real**: Busca instantânea com sugestões

### 🎬 Detalhes dos Filmes
- **Informações Completas**: Sinopse, orçamento, duração, avaliações
- **Elenco Principal**: Atores e personagens
- **Navegação para Perfis**: Acesso direto aos perfis dos atores
- **Sistema de Favoritos**: Adicione/remova da sua lista pessoal

### 👤 Perfis de Atores
- **Biografia Detalhada**: História e informações pessoais
- **Filmografia Completa**: Todos os filmes com paginação
- **Navegação Intuitiva**: Acesso fácil aos filmes do ator

### ⭐ Sistema de Favoritos
- **Sincronização na Nuvem**: Dados salvos no Firebase
- **Lista Personalizada**: Organize seus filmes preferidos
- **Acesso Offline**: Cache local para visualização sem internet

### 👨‍💼 Perfil do Usuário
- **Foto de Perfil**: Upload e edição com otimização automática
- **Informações Pessoais**: Nome, email e configurações
- **Estatísticas**: Número de favoritos e tempo de uso

### ⚙️ Configurações Avançadas
- **Temas**: Claro, escuro ou automático (segue o sistema)
- **Sincronização**: Controle de dados na nuvem
- **Notificações**: Personalize alertas e avisos
- **Cache**: Gerenciamento de dados locais

---

## 🧪 Desenvolvimento e Debug

### Ferramentas de Debug Incluídas

O projeto inclui componentes especiais para desenvolvimento:

- **SimpleDebug**: Testa autenticação e conectividade com Firestore
- **Base64ImageDebug**: Analisa e otimiza imagens do usuário

### Comandos Úteis

```bash
# Limpar cache do Expo
expo r -c

# Build para produção
expo build:android
expo build:ios

# Publicar atualização OTA
expo publish

# Verificar dependências
expo doctor

# Ver logs detalhados
expo start --dev-client
```

### Logs e Monitoramento

O sistema de logs está configurado em `config/debugConfig.js`:

```javascript
export const DEBUG_CONFIG = {
  ENABLE_DEBUG_LOGS: true,
  AUTH_LOGS: true,
  FIRESTORE_LOGS: true,
  THEME_LOGS: true,
  // ... outras configurações
};
```

---

## 🔒 Segurança e Privacidade

### Dados do Usuário
- **Autenticação Segura**: Firebase Authentication com criptografia
- **Dados Privados**: Cada usuário acessa apenas seus próprios dados
- **Imagens Otimizadas**: Processamento local antes do upload
- **Cache Seguro**: Dados sensíveis não armazenados localmente

### Regras de Firestore
As regras de segurança garantem que:
- Usuários só acessam seus próprios dados
- Favoritos são privados e protegidos
- Tentativas de acesso não autorizado são bloqueadas

---

## 👨‍💻 Autor

<div align="center">
  <img src="https://github.com/eeeecb.png" width="100" style="border-radius: 50%;" alt="Eduardo Castro Barbosa"/>
  <br />
  <strong>Eduardo Castro Barbosa</strong>
  <br />
  <sub>Desenvolvedor Full Stack</sub>
  <br />
  <br />
  
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/eeeecb)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/eduardo-castro-barbosa)
</div>

---

## 🙏 Agradecimentos

- [The Movie Database (TMDB)](https://www.themoviedb.org/) pela API gratuita
- [Firebase](https://firebase.google.com/) pelos serviços de backend

---