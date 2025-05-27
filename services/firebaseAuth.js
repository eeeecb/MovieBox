// services/firebaseAuth.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { firebaseStorageService } from './firebaseStorage';

export const firebaseAuthService = {
  // Registrar novo usuário
  async register(name, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Atualizar perfil com o nome
      await updateProfile(user, { displayName: name });
      
      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        profilePicture: null,
        photoURL: null,
        createdAt: new Date().toISOString(),
        uid: user.uid
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message };
    }
  },

  // Login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Buscar dados adicionais do Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
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
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar perfil (dados básicos)
  async updateUserProfile(uid, data) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      // Se o nome foi atualizado, atualizar também no Authentication
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  },

  // Atualizar foto de perfil
  async updateProfilePicture(uid, imageUri, fileInfo = {}) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Buscar dados atuais do usuário
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const oldPhotoURL = userData.profilePicture || userData.photoURL;

      // Fazer upload da nova imagem
      const uploadResult = await firebaseStorageService.uploadProfilePicture(
        uid, 
        imageUri, 
        fileInfo
      );

      if (!uploadResult.success) {
        return uploadResult;
      }

      const newPhotoURL = uploadResult.downloadURL;

      // Atualizar Authentication
      await updateProfile(currentUser, { photoURL: newPhotoURL });

      // Atualizar Firestore (usando ambos os campos para compatibilidade)
      await updateDoc(doc(db, 'users', uid), {
        profilePicture: newPhotoURL,
        photoURL: newPhotoURL,
        updatedAt: new Date().toISOString()
      });

      // Deletar imagem anterior (se existir)
      if (oldPhotoURL && oldPhotoURL !== newPhotoURL) {
        await firebaseStorageService.deleteProfilePicture(oldPhotoURL);
      }

      return { 
        success: true, 
        photoURL: newPhotoURL 
      };

    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      return { 
        success: false, 
        error: 'Erro ao atualizar foto de perfil. Tente novamente.' 
      };
    }
  },

  // Observar mudanças de autenticação
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados adicionais do Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // Sincronizar photoURL entre Authentication e Firestore
          const photoURL = firebaseUser.photoURL || userData.profilePicture || userData.photoURL;
          
          const enrichedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: photoURL,
            metadata: firebaseUser.metadata,
            ...userData
          };
          
          callback(enrichedUser);
        } catch (error) {
          console.error('Erro ao enriquecer dados do usuário:', error);
          callback(firebaseUser);
        }
      } else {
        callback(null);
      }
    });
  },

  // Obter usuário atual
  getCurrentUser() {
    return auth.currentUser;
  }
};