// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Configurar Auth com persistência usando AsyncStorage
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Se já foi inicializado, usar getAuth
  auth = getAuth(app);
}

// Inicializar Firestore
const db = getFirestore(app);

// Inicializar Storage
const storage = getStorage(app);

// Configurações de desenvolvimento (descomente se necessário)
// if (__DEV__) {
//   // Conectar emuladores apenas em desenvolvimento
//   if (!db._delegate._databaseId?.database?.includes('localhost')) {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   }
//   if (!storage._location?.host?.includes('localhost')) {
//     connectStorageEmulator(storage, 'localhost', 9199);
//   }
// }

// Configurar timeout e retry para melhor performance
const authSettings = {
  appVerificationDisabledForTesting: __DEV__, // Apenas em desenvolvimento
};

// Aplicar configurações
if (__DEV__) {
  auth.settings = authSettings;
}

// Log de inicialização (apenas em desenvolvimento)
if (__DEV__) {
  console.log('Firebase inicializado:', {
    auth: !!auth,
    db: !!db,
    storage: !!storage,
    appName: app.name,
    projectId: firebaseConfig.projectId
  });
}

export { auth, db, storage };
export default app;

// Funções utilitárias para debug
export const debugFirebase = () => {
  if (__DEV__) {
    console.log('Estado atual do Firebase:', {
      currentUser: auth.currentUser?.email || 'Nenhum usuário',
      isSignedIn: !!auth.currentUser,
      appName: app.name,
      authPersistence: 'AsyncStorage'
    });
  }
};

// Função para forçar logout (caso necessário)
export const forceLogout = async () => {
  try {
    if (auth.currentUser) {
      await auth.signOut();
    }
    
    // Limpar qualquer cache local relacionado à autenticação
    await AsyncStorage.multiRemove([
      'firebase:host:moviebox-36a3-default-rtdb.firebaseio.com',
      'firebase:authUser:' + firebaseConfig.apiKey + ':[DEFAULT]'
    ]);
    
    console.log('Logout forçado realizado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro no logout forçado:', error);
    return false;
  }
};