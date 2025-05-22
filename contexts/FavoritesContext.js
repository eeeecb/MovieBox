import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Criar o contexto
const FavoritesContext = createContext();

// Hook personalizado para usar favoritos
export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar favoritos do AsyncStorage ao iniciar
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('@favorite_movies');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Verificar se um filme é favorito
  const isFavorite = (movieId) => {
    return favorites.some(movie => movie.id === movieId);
  };

  // Adicionar um filme aos favoritos
  const addFavorite = async (movie) => {
    try {
      if (!movie || !movie.id) {
        throw new Error('Dados do filme inválidos');
      }
      
      // Verificar se o filme já está nos favoritos
      if (isFavorite(movie.id)) {
        return { success: true, message: 'Filme já está nos favoritos' };
      }

      const newFavorites = [...favorites, movie];
      await AsyncStorage.setItem('@favorite_movies', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return { success: false, error: error.message };
    }
  };

  // Remover um filme dos favoritos
  const removeFavorite = async (movieId) => {
    try {
      if (!movieId) {
        throw new Error('ID do filme não fornecido');
      }
      
      // Verificar se o filme está nos favoritos
      if (!isFavorite(movieId)) {
        return { success: false, error: 'Filme não está nos favoritos' };
      }

      const newFavorites = favorites.filter(movie => movie.id !== movieId);
      await AsyncStorage.setItem('@favorite_movies', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return { success: false, error: error.message };
    }
  };

  // Alternar favorito (adicionar ou remover)
  const toggleFavorite = async (movie) => {
    if (isFavorite(movie.id)) {
      return removeFavorite(movie.id);
    } else {
      return addFavorite(movie);
    }
  };

  // Limpar todos os favoritos
  const clearAllFavorites = async () => {
    try {
      await AsyncStorage.removeItem('@favorite_movies');
      setFavorites([]);
      console.log('Todos os favoritos foram removidos'); // Log para debug
      return { success: true };
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
      return { success: false, error: error.message };
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <FavoritesContext.Provider value={{ 
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearAllFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};