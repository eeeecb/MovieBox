import { useState, useEffect } from 'react';
import { tmdbApi } from '../services/tmdbApi';

export const useMovies = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllMovies();
  }, []);

  const loadAllMovies = async () => {
    setLoading(true);
    setError(null);

    try {
      const [nowPlayingResult, popularResult, topRatedResult] = await Promise.all([
        tmdbApi.getNowPlayingMovies(),
        tmdbApi.getPopularMovies(),
        tmdbApi.getTopRatedMovies()
      ]);

      if (nowPlayingResult.success) setNowPlayingMovies(nowPlayingResult.data);
      if (popularResult.success) setPopularMovies(popularResult.data);
      if (topRatedResult.success) setTopRatedMovies(topRatedResult.data);

      if (!nowPlayingResult.success && !popularResult.success && !topRatedResult.success) {
        setError('Erro ao carregar filmes');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    nowPlayingMovies,
    popularMovies,
    topRatedMovies,
    loading,
    error,
    refreshMovies: loadAllMovies
  };
};

export const useMovieDetails = (movieId) => {
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }

    loadMovieDetails();
  }, [movieId]);

  const loadMovieDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const [movieResult, creditsResult] = await Promise.all([
        tmdbApi.getMovieDetails(movieId),
        tmdbApi.getMovieCredits(movieId)
      ]);

      if (movieResult.success) {
        setMovie(movieResult.data);
      } else {
        setError(movieResult.error);
      }

      if (creditsResult.success) {
        setCast(creditsResult.data.slice(0, 6));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    movie,
    cast,
    loading,
    error,
    refetch: loadMovieDetails
  };
};

export const useMovieSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchMovies = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await tmdbApi.searchMovies(query);

      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError(result.error);
        setSearchResults([]);
      }
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setError(null);
  };

  return {
    searchResults,
    loading,
    error,
    searchMovies,
    clearSearch
  };
};