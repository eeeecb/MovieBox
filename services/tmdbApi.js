// src/services/tmdbApi.js
const TMDB_API_KEY = "96b2227903ddc79337303ec7ebeb4b1e";
const BASE_URL = "https://api.themoviedb.org/3";

export const tmdbApi = {
  // Buscar filmes em cartaz
  async getNowPlayingMovies(page = 1) {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`
      );
      const data = await response.json();
      return { success: true, data: data.results || [] };
    } catch (error) {
      console.error('Erro ao buscar filmes em cartaz:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Buscar filmes populares
  async getPopularMovies(page = 1) {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`
      );
      const data = await response.json();
      return { success: true, data: data.results || [] };
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Buscar filmes mais bem avaliados
  async getTopRatedMovies(page = 1) {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`
      );
      const data = await response.json();
      return { success: true, data: data.results || [] };
    } catch (error) {
      console.error('Erro ao buscar filmes mais bem avaliados:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Buscar detalhes de um filme
  async getMovieDetails(movieId) {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Buscar elenco de um filme
  async getMovieCredits(movieId) {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      const data = await response.json();
      return { success: true, data: data.cast || [] };
    } catch (error) {
      console.error('Erro ao buscar elenco:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Buscar detalhes de um ator
  async getActorDetails(actorId) {
    try {
      const response = await fetch(
        `${BASE_URL}/person/${actorId}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar detalhes do ator:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Buscar filmografia de um ator
  async getActorMovies(actorId) {
    try {
      const response = await fetch(
        `${BASE_URL}/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      const data = await response.json();
      return { success: true, data: data.cast || [] };
    } catch (error) {
      console.error('Erro ao buscar filmografia:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Pesquisar filmes
  async searchMovies(query, page = 1) {
    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=${page}`
      );
      const data = await response.json();
      return { success: true, data: data.results || [] };
    } catch (error) {
      console.error('Erro ao pesquisar filmes:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Obter URL da imagem
  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
};