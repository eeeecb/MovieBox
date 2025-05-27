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

  // Atualizar perfil
  async updateUserProfile(uid, data) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  },

  // Observar mudanças de autenticação
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Obter usuário atual
  getCurrentUser() {
    return auth.currentUser;
  }
};