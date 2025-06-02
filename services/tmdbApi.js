const TMDB_API_KEY = "96b2227903ddc79337303ec7ebeb4b1e";
const BASE_URL = "https://api.themoviedb.org/3";

const makeRequest = async (endpoint, page = 1, errorMessage) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`);
    const data = await response.json();
    return { success: true, data: data.results || data };
  } catch (error) {
    console.error(errorMessage, error);
    return { success: false, error: error.message, data: [] };
  }
};

export const tmdbApi = {
  async getNowPlayingMovies(page = 1) {
    return makeRequest('/movie/now_playing', page, 'Erro ao buscar filmes em cartaz:');
  },

  async getPopularMovies(page = 1) {
    return makeRequest('/movie/popular', page, 'Erro ao buscar filmes populares:');
  },

  async getTopRatedMovies(page = 1) {
    return makeRequest('/movie/top_rated', page, 'Erro ao buscar filmes mais bem avaliados:');
  },

  async getMovieDetails(movieId) {
    try {
      const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  async getMovieCredits(movieId) {
    try {
      const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`);
      const data = await response.json();
      return { success: true, data: data.cast || [] };
    } catch (error) {
      console.error('Erro ao buscar elenco:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async getActorDetails(actorId) {
    try {
      const response = await fetch(`${BASE_URL}/person/${actorId}?api_key=${TMDB_API_KEY}&language=pt-BR`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar detalhes do ator:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  async getActorMovies(actorId) {
    try {
      const response = await fetch(`${BASE_URL}/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=pt-BR`);
      const data = await response.json();
      return { success: true, data: data.cast || [] };
    } catch (error) {
      console.error('Erro ao buscar filmografia:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async searchMovies(query, page = 1) {
    try {
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=${page}`);
      const data = await response.json();
      return { success: true, data: data.results || [] };
    } catch (error) {
      console.error('Erro ao pesquisar filmes:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  getImageUrl(path, size = 'w500') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  }
};