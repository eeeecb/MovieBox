// firebaseConfig.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog, errorLog, successLog } from './config/debugConfig';

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

debugLog('FIREBASE', 'Iniciando configuração do Firebase...');

// Verificar se o Firebase já foi inicializado
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  debugLog('FIREBASE', 'Nova instância do Firebase criada');
} else {
  app = getApps()[0];
  debugLog('FIREBASE', 'Usando instância existente do Firebase');
}

// Configurar Auth com tratamento de erro para Expo Go
let auth;
try {
  // Tentar inicializar auth com AsyncStorage primeiro
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  debugLog('FIREBASE', 'Auth inicializado com AsyncStorage persistence');
} catch (error) {
  // Se falhar (já inicializado), usar getAuth
  debugLog('FIREBASE', 'Auth já inicializado, usando getAuth');
  auth = getAuth(app);
}

// Inicializar Firestore e Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Log de inicialização
debugLog('FIREBASE', 'Serviços Firebase inicializados:', {
  auth: !!auth,
  db: !!db,
  storage: !!storage,
  appName: app.name,
  projectId: firebaseConfig.projectId
});

successLog('FIREBASE', 'Firebase configurado com sucesso');

export { auth, db, storage };
export default app;

// Função para debug
export const debugFirebase = () => {
  debugLog('FIREBASE', 'Estado atual do Firebase:', {
    currentUser: auth.currentUser?.email || 'Nenhum usuário',
    isSignedIn: !!auth.currentUser,
    appName: app.name,
    authInitialized: !!auth
  });
};

// Função para verificar se o Firebase está pronto
export const isFirebaseReady = () => {
  try {
    const isReady = !!(auth && db && storage);
    debugLog('FIREBASE', 'Verificação de prontidão:', { isReady });
    return isReady;
  } catch (error) {
    errorLog('FIREBASE', 'Erro ao verificar Firebase:', error);
    return false;
  }
};

// Função para aguardar inicialização completa
export const waitForFirebase = () => {
  return new Promise((resolve) => {
    debugLog('FIREBASE', 'Aguardando inicialização completa...');
    
    const checkReady = () => {
      if (isFirebaseReady()) {
        debugLog('FIREBASE', 'Firebase está pronto!');
        resolve(true);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  });
};