// services/firestoreService.js
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const firestoreService = {
  // Adicionar filme aos favoritos
  async addFavorite(userId, movie) {
    try {
      const favoriteId = `${userId}_${movie.id}`;
      await setDoc(doc(db, 'favorites', favoriteId), {
        userId,
        movieId: movie.id,
        movieData: movie,
        addedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return { success: false, error: error.message };
    }
  },

  // Remover filme dos favoritos
  async removeFavorite(userId, movieId) {
    try {
      const favoriteId = `${userId}_${movieId}`;
      await deleteDoc(doc(db, 'favorites', favoriteId));
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return { success: false, error: error.message };
    }
  },

  // Buscar favoritos do usuário
  async getUserFavorites(userId) {
    try {
      const q = query(
        collection(db, 'favorites'), 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const favorites = [];
      
      querySnapshot.forEach((doc) => {
        favorites.push(doc.data().movieData);
      });
      
      return { success: true, favorites };
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return { success: false, error: error.message, favorites: [] };
    }
  },

  // Verificar se um filme é favorito
  async isFavorite(userId, movieId) {
    try {
      const favoriteId = `${userId}_${movieId}`;
      const docSnap = await getDoc(doc(db, 'favorites', favoriteId));
      return docSnap.exists();
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  },

  // Observar mudanças nos favoritos em tempo real
  onFavoritesChanged(userId, callback) {
    const q = query(
      collection(db, 'favorites'), 
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const favorites = [];
      querySnapshot.forEach((doc) => {
        favorites.push(doc.data().movieData);
      });
      callback(favorites);
    });
  }
};