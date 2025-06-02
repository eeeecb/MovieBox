import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { base64ImageService } from './base64ImageService';
import { debugLog, errorLog, successLog, warnLog } from '../config/debugConfig';

let auth, db;

const initializeServices = async () => {
  if (!auth || !db) {
    const { auth: firebaseAuth, db: firebaseDb } = await import('../firebaseConfig');
    auth = firebaseAuth;
    db = firebaseDb;
  }
  return { auth, db };
};

const getAuthErrorMessage = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Este email já está em uso',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
    'auth/invalid-email': 'Email inválido',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde'
  };
  return errorMessages[error.code] || 'Erro na autenticação';
};

const createUserDocument = async (user, name) => {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email: user.email,
      displayName: name,
      profilePictureBase64: null,
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      uid: user.uid,
      preferences: {
        notifications: true,
        autoSync: true,
        theme: 'system'
      }
    });
    successLog('AUTH', 'Documento do usuário criado no Firestore');
    return true;
  } catch (firestoreError) {
    warnLog('AUTH', 'Não foi possível criar documento no Firestore: ' + firestoreError.message);
    return false;
  }
};

const updateLastLogin = async (uid) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      lastLoginAt: new Date().toISOString()
    });
    debugLog('AUTH', 'Último login atualizado no Firestore');
  } catch (firestoreError) {
    warnLog('AUTH', 'Não foi possível atualizar último login: ' + firestoreError.message);
  }
};

const enrichUserData = async (firebaseUser) => {
  let userData = {
    preferences: {
      notifications: true,
      autoSync: true,
      theme: 'system'
    }
  };

  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      userData = { ...userData, ...userDoc.data() };
      debugLog('AUTH', 'Dados do Firestore carregados', { hasData: true });
    } else {
      debugLog('AUTH', 'Documento do usuário não existe no Firestore');
    }
  } catch (firestoreError) {
    warnLog('AUTH', 'Não foi possível enriquecer dados do usuário: ' + firestoreError.message);
    
    if (firestoreError.code === 'permission-denied') {
      warnLog('AUTH', 'Regras de segurança do Firestore precisam ser configuradas');
    }
  }

  let photoURL = firebaseUser.photoURL;
  if (userData.profilePictureBase64) {
    photoURL = userData.profilePictureBase64;
    debugLog('AUTH', 'Usando profilePictureBase64');
  } else if (userData.photoURL) {
    photoURL = userData.photoURL;
    debugLog('AUTH', 'Usando photoURL do Firestore');
  }

  const enrichedUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || userData.name || userData.displayName,
    photoURL: photoURL,
    metadata: firebaseUser.metadata,
    preferences: userData.preferences || {
      notifications: true,
      autoSync: true,
      theme: 'system'
    },
    firestoreAvailable: Object.keys(userData).length > 1
  };

  debugLog('AUTH', 'Usuário enriquecido:', {
    uid: enrichedUser.uid,
    hasDisplayName: !!enrichedUser.displayName,
    hasPhoto: !!enrichedUser.photoURL,
    firestoreAvailable: enrichedUser.firestoreAvailable
  });

  return enrichedUser;
};

export const firebaseAuthService = {
  async ensureInitialized() {
    return await initializeServices();
  },

  async register(name, email, password) {
    try {
      await initializeServices();
      
      debugLog('AUTH', 'Iniciando registro de usuário', { email, name });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      debugLog('AUTH', 'Usuário criado no Firebase Auth', { uid: user.uid });
      
      await updateProfile(user, { displayName: name });
      debugLog('AUTH', 'Perfil atualizado com displayName');
      
      await createUserDocument(user, name);
      
      successLog('AUTH', 'Registro concluído com sucesso');
      return { success: true, user };
    } catch (error) {
      errorLog('AUTH', 'Erro no registro:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }
  },

  async login(email, password) {
    try {
      await initializeServices();
      
      debugLog('AUTH', 'Iniciando login', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      debugLog('AUTH', 'Login realizado no Firebase Auth', { uid: user.uid });
      
      await updateLastLogin(user.uid);
      
      const userData = await enrichUserData(user);
      
      successLog('AUTH', 'Login concluído com sucesso');
      return { success: true, user: userData };
    } catch (error) {
      errorLog('AUTH', 'Erro no login:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }
  },

  async logout() {
    try {
      await initializeServices();
      
      debugLog('AUTH', 'Iniciando processo de logout');
      
      if (!auth.currentUser) {
        debugLog('AUTH', 'Nenhum usuário logado, logout não necessário');
        return { success: true };
      }

      debugLog('AUTH', 'Usuário atual encontrado, executando signOut');
      
      await signOut(auth);
      
      successLog('AUTH', 'Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      errorLog('AUTH', 'Erro no logout:', error);
      
      try {
        if (auth) {
          await signOut(auth);
          debugLog('AUTH', 'Logout forçado executado');
        }
      } catch (forceError) {
        errorLog('AUTH', 'Erro ao forçar logout:', forceError);
      }
      
      return { success: false, error: 'Erro ao fazer logout. Tente novamente.' };
    }
  },

  async updateUserProfile(uid, data) {
    try {
      await initializeServices();
      
      debugLog('AUTH', 'Atualizando perfil do usuário', { uid, data });
      
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      try {
        await updateDoc(doc(db, 'users', uid), {
          ...data,
          updatedAt: new Date().toISOString()
        });
        debugLog('AUTH', 'Perfil atualizado no Firestore');
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível atualizar Firestore: ' + firestoreError.message);
      }
      
      if (data.name && currentUser) {
        await updateProfile(currentUser, { displayName: data.name });
        debugLog('AUTH', 'DisplayName atualizado no Firebase Auth');
      }
      
      successLog('AUTH', 'Perfil atualizado com sucesso');
      return { success: true };
    } catch (error) {
      errorLog('AUTH', 'Erro ao atualizar perfil:', error);
      return { success: false, error: 'Erro ao atualizar perfil. Tente novamente.' };
    }
  },

  async updateProfilePicture(uid, imageUri, fileInfo = {}) {
    try {
      await initializeServices();
      
      debugLog('AUTH', 'Atualizando foto de perfil (Base64)', { uid });
      
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      debugLog('AUTH', 'Validando imagem para conversão base64...');
      const validation = base64ImageService.validateImageForBase64({
        width: fileInfo.width,
        height: fileInfo.height,
        fileSize: fileInfo.fileSize,
        mimeType: fileInfo.mimeType
      });

      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      debugLog('AUTH', 'Convertendo imagem para base64...');
      const base64Result = await base64ImageService.processImageToBase64(imageUri);

      if (!base64Result.success) {
        return { success: false, error: base64Result.error };
      }

      const { dataUri, sizeKB } = base64Result;
      debugLog('AUTH', `Imagem convertida para base64: ${sizeKB}KB`);

      try {
        await updateDoc(doc(db, 'users', uid), {
          profilePictureBase64: dataUri,
          photoURL: dataUri,
          updatedAt: new Date().toISOString(),
          profilePictureStats: {
            sizeKB: sizeKB,
            width: base64Result.width,
            height: base64Result.height,
            updatedAt: new Date().toISOString()
          }
        });
        debugLog('AUTH', 'Base64 salvo no Firestore com sucesso');
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível salvar no Firestore: ' + firestoreError.message);
        return { success: false, error: 'Erro ao salvar imagem. Verifique sua conexão.' };
      }

      try {
        await updateProfile(currentUser, { photoURL: dataUri });
        debugLog('AUTH', 'PhotoURL atualizado no Firebase Auth');
      } catch (authError) {
        warnLog('AUTH', 'Não foi possível atualizar Auth photoURL: ' + authError.message);
      }

      successLog('AUTH', `Foto de perfil atualizada (Base64 - ${sizeKB}KB)`);
      return { success: true, photoURL: dataUri, sizeKB: sizeKB };

    } catch (error) {
      errorLog('AUTH', 'Erro ao atualizar foto de perfil:', error);
      return { success: false, error: 'Erro ao atualizar foto de perfil. Tente novamente.' };
    }
  },

  async updateUserPreferences(uid, preferences) {
    try {
      await initializeServices();
      
      debugLog('AUTH', 'Atualizando preferências do usuário', { uid, preferences });
      
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      try {
        await updateDoc(doc(db, 'users', uid), {
          preferences: { ...preferences },
          updatedAt: new Date().toISOString()
        });
        successLog('AUTH', 'Preferências atualizadas no Firestore');
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível atualizar preferências no Firestore: ' + firestoreError.message);
        
        if (firestoreError.code === 'permission-denied') {
          return { 
            success: false, 
            error: 'Configure as regras de segurança do Firestore para salvar preferências na nuvem' 
          };
        }
        return { success: false, error: 'Erro ao salvar preferências' };
      }

      return { success: true };
    } catch (error) {
      errorLog('AUTH', 'Erro ao atualizar preferências:', error);
      return { success: false, error: 'Erro ao atualizar preferências' };
    }
  },

  onAuthStateChanged(callback) {
    return new Promise(async (resolve) => {
      await initializeServices();
      
      debugLog('AUTH', 'Configurando listener de estado de autenticação');
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          debugLog('AUTH', 'Usuário detectado, enriquecendo dados', { uid: firebaseUser.uid });
          
          try {
            const enrichedUser = await enrichUserData(firebaseUser);
            callback(enrichedUser);
          } catch (error) {
            errorLog('AUTH', 'Erro geral ao processar usuário:', error);
            callback({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              metadata: firebaseUser.metadata,
              preferences: {
                notifications: true,
                autoSync: true,
                theme: 'system'
              },
              firestoreAvailable: false
            });
          }
        } else {
          debugLog('AUTH', 'Nenhum usuário logado');
          callback(null);
        }
      });
      
      resolve(unsubscribe);
    });
  },

  async checkFirestoreAccess(uid) {
    try {
      await initializeServices();
      
      debugLog('AUTH', 'Verificando acesso ao Firestore', { uid });
      const testDoc = await getDoc(doc(db, 'users', uid));
      const result = { accessible: true, exists: testDoc.exists() };
      debugLog('AUTH', 'Verificação de acesso concluída', result);
      return result;
    } catch (error) {
      warnLog('AUTH', 'Firestore não acessível: ' + error.message);
      return { accessible: false, error: error.code };
    }
  },

  async getCurrentUser() {
    try {
      await initializeServices();
      const user = auth.currentUser;
      debugLog('AUTH', 'Usuário atual obtido', { hasUser: !!user });
      return user;
    } catch (error) {
      warnLog('AUTH', 'Erro ao obter usuário atual: ' + error.message);
      return null;
    }
  },

  async isAuthenticated() {
    try {
      await initializeServices();
      const isAuth = !!auth.currentUser;
      debugLog('AUTH', 'Verificação de autenticação', { isAuthenticated: isAuth });
      return isAuth;
    } catch (error) {
      warnLog('AUTH', 'Erro ao verificar autenticação: ' + error.message);
      return false;
    }
  }
};