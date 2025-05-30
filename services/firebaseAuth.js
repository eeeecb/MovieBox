// services/firebaseAuth.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firebaseStorageService } from './firebaseStorage';
import { debugLog, errorLog, successLog, warnLog } from '../config/debugConfig';

// Importação dinâmica para evitar problemas de inicialização
let auth, db;

const initializeServices = async () => {
  if (!auth || !db) {
    const { auth: firebaseAuth, db: firebaseDb } = await import('../firebaseConfig');
    auth = firebaseAuth;
    db = firebaseDb;
  }
  return { auth, db };
};

export const firebaseAuthService = {
  // Garantir que os serviços estão inicializados
  async ensureInitialized() {
    return await initializeServices();
  },

  // Registrar novo usuário
  async register(name, email, password) {
    try {
      await this.ensureInitialized();
      
      debugLog('AUTH', 'Iniciando registro de usuário', { email, name });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      debugLog('AUTH', 'Usuário criado no Firebase Auth', { uid: user.uid });
      
      // Atualizar perfil com o nome
      await updateProfile(user, { displayName: name });
      debugLog('AUTH', 'Perfil atualizado com displayName');
      
      // Tentar criar documento do usuário no Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          displayName: name,
          profilePicture: null,
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
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível criar documento no Firestore: ' + firestoreError.message);
        // Continuar mesmo se falhar - o usuário foi criado no Auth
      }
      
      successLog('AUTH', 'Registro concluído com sucesso');
      return { success: true, user };
    } catch (error) {
      errorLog('AUTH', 'Erro no registro:', error);
      
      // Tratar erros específicos
      let errorMessage = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Login
  async login(email, password) {
    try {
      await this.ensureInitialized();
      
      debugLog('AUTH', 'Iniciando login', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      debugLog('AUTH', 'Login realizado no Firebase Auth', { uid: user.uid });
      
      // Tentar atualizar último login no Firestore
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: new Date().toISOString()
        });
        debugLog('AUTH', 'Último login atualizado no Firestore');
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível atualizar último login: ' + firestoreError.message);
        // Não é crítico, continuar
      }
      
      // Tentar buscar dados adicionais do Firestore
      let userData = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        userData = userDoc.exists() ? userDoc.data() : null;
        debugLog('AUTH', 'Dados do usuário carregados do Firestore', { hasData: !!userData });
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível buscar dados do Firestore: ' + firestoreError.message);
        // Usar dados padrão
        userData = {
          preferences: {
            notifications: true,
            autoSync: true,
            theme: 'system'
          }
        };
      }
      
      successLog('AUTH', 'Login concluído com sucesso');
      return { 
        success: true, 
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL || userData?.profilePicture || userData?.photoURL,
          ...userData
        }
      };
    } catch (error) {
      errorLog('AUTH', 'Erro no login:', error);
      
      // Tratar erros específicos
      let errorMessage = 'Erro ao fazer login';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Logout melhorado
  async logout() {
    try {
      await this.ensureInitialized();
      
      debugLog('AUTH', 'Iniciando processo de logout');
      
      // Garantir que há um usuário logado
      if (!auth.currentUser) {
        debugLog('AUTH', 'Nenhum usuário logado, logout não necessário');
        return { success: true }; // Já está deslogado
      }

      debugLog('AUTH', 'Usuário atual encontrado, executando signOut');
      
      // Fazer logout do Firebase Auth
      await signOut(auth);
      
      successLog('AUTH', 'Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      errorLog('AUTH', 'Erro no logout:', error);
      
      // Mesmo com erro, tentar forçar o logout
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

  // Atualizar perfil (dados básicos) - com fallback
  async updateUserProfile(uid, data) {
    try {
      await this.ensureInitialized();
      
      debugLog('AUTH', 'Atualizando perfil do usuário', { uid, data });
      
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Tentar atualizar Firestore
      try {
        await updateDoc(doc(db, 'users', uid), {
          ...data,
          updatedAt: new Date().toISOString()
        });
        debugLog('AUTH', 'Perfil atualizado no Firestore');
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível atualizar Firestore: ' + firestoreError.message);
        // Continuar mesmo se falhar no Firestore
      }
      
      // Se o nome foi atualizado, atualizar também no Authentication
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

  // Atualizar foto de perfil - com fallback
  async updateProfilePicture(uid, imageUri, fileInfo = {}) {
    try {
      await this.ensureInitialized();
      
      debugLog('AUTH', 'Atualizando foto de perfil', { uid });
      
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Buscar dados atuais do usuário (com fallback)
      let userData = {};
      let oldPhotoURL = null;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        userData = userDoc.exists() ? userDoc.data() : {};
        oldPhotoURL = userData.profilePicture || userData.photoURL;
        debugLog('AUTH', 'Dados atuais do usuário carregados');
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível buscar dados atuais: ' + firestoreError.message);
        oldPhotoURL = currentUser.photoURL;
      }

      // Fazer upload da nova imagem
      debugLog('AUTH', 'Iniciando upload da imagem');
      const uploadResult = await firebaseStorageService.uploadProfilePicture(
        uid, 
        imageUri, 
        fileInfo
      );

      if (!uploadResult.success) {
        return uploadResult;
      }

      const newPhotoURL = uploadResult.downloadURL;
      debugLog('AUTH', 'Upload concluído', { newPhotoURL });

      // Atualizar Authentication
      await updateProfile(currentUser, { photoURL: newPhotoURL });
      debugLog('AUTH', 'PhotoURL atualizado no Firebase Auth');

      // Tentar atualizar Firestore
      try {
        await updateDoc(doc(db, 'users', uid), {
          profilePicture: newPhotoURL,
          photoURL: newPhotoURL,
          updatedAt: new Date().toISOString()
        });
        debugLog('AUTH', 'Foto atualizada no Firestore');
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível atualizar foto no Firestore: ' + firestoreError.message);
        // Não é crítico, a foto foi atualizada no Auth
      }

      // Deletar imagem anterior (se existir)
      if (oldPhotoURL && oldPhotoURL !== newPhotoURL) {
        await firebaseStorageService.deleteProfilePicture(oldPhotoURL);
        debugLog('AUTH', 'Imagem anterior deletada');
      }

      successLog('AUTH', 'Foto de perfil atualizada com sucesso');
      return { 
        success: true, 
        photoURL: newPhotoURL 
      };

    } catch (error) {
      errorLog('AUTH', 'Erro ao atualizar foto de perfil:', error);
      return { 
        success: false, 
        error: 'Erro ao atualizar foto de perfil. Tente novamente.' 
      };
    }
  },

  // Atualizar preferências do usuário - com fallback
  async updateUserPreferences(uid, preferences) {
    try {
      await this.ensureInitialized();
      
      debugLog('AUTH', 'Atualizando preferências do usuário', { uid, preferences });
      
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      try {
        await updateDoc(doc(db, 'users', uid), {
          preferences: {
            ...preferences
          },
          updatedAt: new Date().toISOString()
        });
        successLog('AUTH', 'Preferências atualizadas no Firestore');
      } catch (firestoreError) {
        warnLog('AUTH', 'Não foi possível atualizar preferências no Firestore: ' + firestoreError.message);
        // Retornar erro específico para preferências
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

  // Observar mudanças de autenticação (robusta)
  onAuthStateChanged(callback) {
    return new Promise(async (resolve) => {
      await this.ensureInitialized();
      
      debugLog('AUTH', 'Configurando listener de estado de autenticação');
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          debugLog('AUTH', 'Usuário detectado, enriquecendo dados', { uid: firebaseUser.uid });
          
          try {
            // Tentar buscar dados adicionais do Firestore
            let userData = {};
            
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              userData = userDoc.exists() ? userDoc.data() : {};
              debugLog('AUTH', 'Dados do Firestore carregados', { hasData: !!userData });
            } catch (firestoreError) {
              warnLog('AUTH', 'Não foi possível enriquecer dados do usuário: ' + firestoreError.message);
              
              // Se for erro de permissão, criar dados padrão
              if (firestoreError.code === 'permission-denied') {
                warnLog('AUTH', 'Regras de segurança do Firestore precisam ser configuradas');
              }
              
              // Usar dados padrão
              userData = {
                preferences: {
                  notifications: true,
                  autoSync: true,
                  theme: 'system'
                }
              };
            }
            
            // Sincronizar photoURL entre Authentication e Firestore
            const photoURL = firebaseUser.photoURL || userData.profilePicture || userData.photoURL;
            
            const enrichedUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userData.name,
              photoURL: photoURL,
              metadata: firebaseUser.metadata,
              preferences: userData.preferences || {
                notifications: true,
                autoSync: true,
                theme: 'system'
              },
              ...userData,
              // Flag para indicar se dados do Firestore estão disponíveis
              firestoreAvailable: Object.keys(userData).length > 1
            };
            
            debugLog('AUTH', 'Usuário enriquecido criado', { uid: enrichedUser.uid, firestoreAvailable: enrichedUser.firestoreAvailable });
            callback(enrichedUser);
          } catch (error) {
            errorLog('AUTH', 'Erro geral ao processar usuário:', error);
            // Em caso de erro, retornar dados básicos do Firebase Auth
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

  // Verificar se Firestore está acessível
  async checkFirestoreAccess(uid) {
    try {
      await this.ensureInitialized();
      
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

  // Obter usuário atual de forma segura
  async getCurrentUser() {
    try {
      await this.ensureInitialized();
      const user = auth.currentUser;
      debugLog('AUTH', 'Usuário atual obtido', { hasUser: !!user });
      return user;
    } catch (error) {
      warnLog('AUTH', 'Erro ao obter usuário atual: ' + error.message);
      return null;
    }
  },

  // Verificar se usuário está autenticado de forma segura
  async isAuthenticated() {
    try {
      await this.ensureInitialized();
      const isAuth = !!auth.currentUser;
      debugLog('AUTH', 'Verificação de autenticação', { isAuthenticated: isAuth });
      return isAuth;
    } catch (error) {
      warnLog('AUTH', 'Erro ao verificar autenticação: ' + error.message);
      return false;
    }
  }
};