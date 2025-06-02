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

const handleFirestoreError = (error, action) => {
  console.error(`Erro ao ${action}:`, error);
  return { success: false, error: error.message };
};

export const firestoreService = {
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
      return handleFirestoreError(error, 'adicionar favorito');
    }
  },

  async removeFavorite(userId, movieId) {
    try {
      const favoriteId = `${userId}_${movieId}`;
      await deleteDoc(doc(db, 'favorites', favoriteId));
      return { success: true };
    } catch (error) {
      return handleFirestoreError(error, 'remover favorito');
    }
  },

  async getUserFavorites(userId) {
    try {
      const q = query(collection(db, 'favorites'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const favorites = querySnapshot.docs.map(doc => doc.data().movieData);
      
      return { success: true, favorites };
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return { success: false, error: error.message, favorites: [] };
    }
  },

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

  onFavoritesChanged(userId, callback) {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    
    return onSnapshot(q, (querySnapshot) => {
      const favorites = querySnapshot.docs.map(doc => doc.data().movieData);
      callback(favorites);
    });
  }
};