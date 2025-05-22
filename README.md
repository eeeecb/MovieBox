# 🎬 MovieBox

🍿 **Seu catálogo digital de filmes desenvolvido em React Native** 🍿

## 📱 Visão Geral do Projeto

MovieBox é um aplicativo móvel desenvolvido em React Native que permite aos usuários explorar, pesquisar e favoritar filmes de todas as categorias.

## ✨ Principais Funcionalidades

- 🔍 **Pesquisa inteligente** de filmes em tempo real
- 🏠 **Feed personalizado** com filmes em cartaz, populares e mais bem avaliados
- ⭐ Sistema de **favoritos** vinculado à conta do usuário
- 👤 **Perfil de usuário** com autenticação segura
- 🌙 Suporte a **tema claro e escuro** (com opção de seguir o sistema)
- 👨‍👩‍👧‍👦 Exploração de **perfis de atores** e suas filmografias
- 📊 Visualização de **detalhes completos** dos filmes (orçamento, avaliações, elenco)

## 🔧 Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma para desenvolvimento React Native simplificado
- **React Navigation** - Navegação entre telas
- **Context API** - Gerenciamento de estado global
- **AsyncStorage** - Persistência de dados local
- **The Movie Database API** - API pública para dados de filmes
- **Expo Google Fonts** - Fontes personalizadas
- **Expo Vector Icons** - Pacote de ícones

## 📂 Estrutura do Projeto

```
moviebox/
├── assets/               # Ícones, imagens e outras mídias
├── components/           # Componentes reutilizáveis
│   └── ThemePreview.js   # Componente para visualização de temas
├── contexts/             # Contextos React
│   ├── AuthContext.js    # Gerenciamento de autenticação
│   ├── FavoritesContext.js # Gerenciamento de favoritos
│   └── ThemeContext.js   # Gerenciamento de temas
├── screens/              # Telas do aplicativo
│   ├── HomeScreen.js     # Tela inicial com catálogo e pesquisa
│   ├── MovieScreen.js    # Detalhes do filme
│   ├── ActorScreen.js    # Perfil do ator
│   ├── FavoritesScreen.js # Lista de favoritos
│   └── SettingsScreen.js # Configurações do app
├── App.js                # Componente raiz
└── index.js              # Ponto de entrada
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (v14 ou superior)
- NPM ou Yarn
- Expo CLI (`npm install -g expo-cli`)
- Um editor como VSCode

### Passos para instalação

1. Clone este repositório
   ```bash
   git clone https://github.com/eeeecb/MovieBox.git
   cd MovieBox
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure a API TMDb
   - Obtenha uma chave de API em [themoviedb.org](https://www.themoviedb.org/settings/api)
   - Substitua a chave API em `screens/HomeScreen.js`, `screens/MovieScreen.js` e `screens/ActorScreen.js`

4. Inicie o aplicativo
   ```bash
   expo start
   ```

## 🌟 Recursos Avançados

### Sistema de Autenticação
O aplicativo implementa um sistema de autenticação simulado usando AsyncStorage, permitindo criação de contas, login e persistência da sessão do usuário.

### Favoritos por Usuário
Cada usuário possui sua própria lista de favoritos armazenada de forma segura e vinculada à sua conta.

### Tema Dinâmico
O aplicativo oferece suporte a temas claros e escuros, com a opção de seguir automaticamente as configurações do sistema ou personalizar manualmente.

### Pesquisa Otimizada
O recurso de pesquisa implementa debouncing para minimizar requisições à API e proporcionar uma experiência mais fluida.

## 🧠 Aprendizados e Desafios

Durante o desenvolvimento deste projeto, enfrentei vários desafios:

- Implementação de contextos globais para gerenciamento de estado
- Otimização de navegação entre telas
- Desenvolvimento de uma experiência de pesquisa fluida e responsiva
- Criação de um sistema de temas completo adaptável às preferências do usuário
- Desenvolvimento de autenticação e persistência de dados com AsyncStorage

Esses desafios resultaram em um aprendizado significativo sobre desenvolvimento React Native e práticas modernas de UI/UX para aplicativos móveis.

## 📊 Status do Projeto

O MovieBox está em sua versão 1.0.0, com todas as funcionalidades principais implementadas. Futuras atualizações podem incluir:

- Implementação de testes automatizados
- Integração com serviços de streaming
- Notificações para lançamentos de filmes
- Compartilhamento de favoritos em redes sociais

## 👤 Autor

**Eduardo Castro Barbosa**
- GitHub: [github.com/eeeecb](https://github.com/eeeecb)

---
