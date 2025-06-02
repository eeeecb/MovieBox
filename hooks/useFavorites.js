import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';

export const useFavorites = (userId) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    const unsubscribe = firestoreService.onFavoritesChanged(userId, (updatedFavorites) => {
      setFavorites(updatedFavorites);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleFavoriteAction = async (action, ...args) => {
    if (!userId) return { success: false, error: 'Usuário não autenticado' };
    
    try {
      const result = await action(userId, ...args);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const addFavorite = async (movie) => {
    return handleFavoriteAction(firestoreService.addFavorite, movie);
  };

  const removeFavorite = async (movieId) => {
    return handleFavoriteAction(firestoreService.removeFavorite, movieId);
  };

  const toggleFavorite = async (movie) => {
    const isCurrentlyFavorite = favorites.some(fav => fav.id === movie.id);
    
    return isCurrentlyFavorite 
      ? await removeFavorite(movie.id)
      : await addFavorite(movie);
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