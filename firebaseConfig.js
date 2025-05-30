// firebaseConfig.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANBzWjHohwvzFuU4X7RD9BNx3C4KCYqdA",
  authDomain: "moviebox-36a3.firebaseapp.com",
  projectId: "moviebox-36a3",
  storageBucket: "moviebox-36a3.firebasestorage.app",
  messagingSenderId: "624126096018",
  appId: "1:624126096018:web:70b122a4f9c28ea654ac4b",
  measurementId: "G-RB3Q30ET88"
};

// Verificar se o Firebase já foi inicializado
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Configurar Auth com tratamento de erro para Expo Go
let auth;
try {
  // Tentar inicializar auth com AsyncStorage primeiro
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Se falhar (já inicializado), usar getAuth
  console.log('Auth já inicializado, usando getAuth');
  auth = getAuth(app);
}

// Inicializar Firestore e Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Log de inicialização apenas em desenvolvimento
if (__DEV__) {
  console.log('✅ Firebase inicializado com sucesso:', {
    auth: !!auth,
    db: !!db,
    storage: !!storage,
    appName: app.name,
    projectId: firebaseConfig.projectId
  });
}

export { auth, db, storage };
export default app;

// Função para debug
export const debugFirebase = () => {
  if (__DEV__) {
    console.log('Estado atual do Firebase:', {
      currentUser: auth.currentUser?.email || 'Nenhum usuário',
      isSignedIn: !!auth.currentUser,
      appName: app.name,
      authInitialized: !!auth
    });
  }
};

// Função para verificar se o Firebase está pronto
export const isFirebaseReady = () => {
  try {
    return !!(auth && db && storage);
  } catch (error) {
    console.error('Erro ao verificar Firebase:', error);
    return false;
  }
};

// Função para aguardar inicialização completa
export const waitForFirebase = () => {
  return new Promise((resolve) => {
    const checkReady = () => {
      if (isFirebaseReady()) {
        resolve(true);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  });
};