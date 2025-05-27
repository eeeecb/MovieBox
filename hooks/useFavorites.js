// hooks/useFavorites.js
import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';

export const useFavorites = (userId) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar favoritos quando o componente monta ou userId muda
  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const loadFavorites = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await firestoreService.getUserFavorites(userId);
        
        if (result.success) {
          setFavorites(result.favorites);
        } else {
          setError(result.error);
          setFavorites([]);
        }
      } catch (err) {
        setError(err.message);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Configurar listener em tempo real
    const unsubscribe = firestoreService.onFavoritesChanged(userId, (updatedFavorites) => {
      setFavorites(updatedFavorites);
    });

    return () => unsubscribe();
  }, [userId]);

  const addFavorite = async (movie) => {
    if (!userId) return { success: false, error: 'Usuário não autenticado' };
    
    try {
      const result = await firestoreService.addFavorite(userId, movie);
      
      if (result.success) {
        // O listener em tempo real atualizará automaticamente o estado
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const removeFavorite = async (movieId) => {
    if (!userId) return { success: false, error: 'Usuário não autenticado' };
    
    try {
      const result = await firestoreService.removeFavorite(userId, movieId);
      
      if (result.success) {
        // O listener em tempo real atualizará automaticamente o estado
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const toggleFavorite = async (movie) => {
    const isCurrentlyFavorite = favorites.some(fav => fav.id === movie.id);
    
    if (isCurrentlyFavorite) {
      return await removeFavorite(movie.id);
    } else {
      return await addFavorite(movie);
    }
  };

  const isFavorite = (movieId) => {
    return favorites.some(movie => movie.id === movieId);
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  };
};