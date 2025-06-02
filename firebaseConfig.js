import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog, errorLog, successLog } from './config/debugConfig';

const firebaseConfig = {
  apiKey: "AIzaSyANBzWjHohwvzFuU4X7RD9BNx3C4KCYqdA",
  authDomain: "moviebox-36a3.firebaseapp.com",
  projectId: "moviebox-36a3",
  messagingSenderId: "624126096018",
  appId: "1:624126096018:web:70b122a4f9c28ea654ac4b",
  measurementId: "G-RB3Q30ET88"
};

debugLog('FIREBASE', 'Iniciando configuração do Firebase...');

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  debugLog('FIREBASE', 'Auth inicializado com AsyncStorage persistence');
} catch (error) {
  debugLog('FIREBASE', 'Auth já inicializado, usando getAuth');
  auth = getAuth(app);
}

const db = getFirestore(app);

debugLog('FIREBASE', 'Serviços Firebase inicializados:', {
  auth: !!auth,
  db: !!db,
  appName: app.name,
  projectId: firebaseConfig.projectId
});

successLog('FIREBASE', 'Firebase configurado com sucesso');

export { auth, db };
export default app;

export const debugFirebase = () => {
  debugLog('FIREBASE', 'Estado atual do Firebase:', {
    currentUser: auth.currentUser?.email || 'Nenhum usuário',
    isSignedIn: !!auth.currentUser,
    appName: app.name,
    authInitialized: !!auth
  });
};

export const isFirebaseReady = () => {
  try {
    const isReady = !!(auth && db);
    debugLog('FIREBASE', 'Verificação de prontidão:', { isReady });
    return isReady;
  } catch (error) {
    errorLog('FIREBASE', 'Erro ao verificar Firebase:', error);
    return false;
  }
};

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