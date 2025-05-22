import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useFonts, EncodeSansExpanded_400Regular, EncodeSansExpanded_500Medium } from '@expo-google-fonts/encode-sans-expanded';
import { Ramabhadra_400Regular } from '@expo-google-fonts/ramabhadra';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Ionicons } from '@expo/vector-icons';

// O correto seria usar um .env, mas para o propósito do projeto isso vai servir
const TMDB_API_KEY = "96b2227903ddc79337303ec7ebeb4b1e";

export default function MovieScreen({ route, navigation }) {
  const { theme, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Obter o ID do filme dos parâmetros de navegação
  const { movieId: paramMovieId } = route.params || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Função para pesquisar filmes
  const searchMovies = async (query) => {
    if (!query) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setSearching(true);
    setError(null);
    
    try {
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`
      );
      
      const searchData = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        setSearchResults(searchData.results.slice(0, 10)); // Limitamos a 10 resultados
        setShowResults(true);
      } else {
        setSearchResults([]);
        setError('Nenhum filme encontrado');
      }
    } catch (err) {
      setError('Erro ao buscar filmes');
      console.error('Error searching movies:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Função para selecionar e carregar um filme específico
  const loadMovie = async (movieId) => {
    setLoading(true);
    setError(null);
    setShowResults(false);
    
    try {
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      
      const movieData = await movieResponse.json();
      setMovie(movieData);
      
      const creditsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      
      const creditsData = await creditsResponse.json();
      setCast(creditsData.cast.slice(0, 6));
    } catch (err) {
      setError('Erro ao buscar dados do filme');
      console.error('Error fetching movie data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com seleção de filme nos resultados
  const handleMovieSelect = (movieId) => {
    loadMovie(movieId);
    // Limpa a barra de pesquisa
    setSearchQuery('');
  };

  // Carrega o filme quando o ID é fornecido via navegação ou carrega um filme popular aleatório
  useEffect(() => {
    if (paramMovieId) {
      // Se temos um ID específico nos parâmetros, carregamos esse filme
      loadMovie(paramMovieId);
    } else {
      // Caso contrário, carregamos um filme popular aleatório
      const popularMovieIds = [505642, 447365, 299534, 299536, 920, 429617];
      const randomIndex = Math.floor(Math.random() * popularMovieIds.length);
      loadMovie(popularMovieIds[randomIndex]);
    }
  }, [paramMovieId]);

  // Efeito para pesquisar enquanto digita (com debounce)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchMovies(searchQuery);
      } else if (searchQuery.length === 0) {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500); // Espera 500ms após o último caractere digitado

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.length >= 2) {
      searchMovies(searchQuery);
    }
  };

  // Função para alternar favorito
  const handleToggleFavorite = async () => {
    if (!movie || isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    
    try {
      const movieInfo = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date
      };
      
      await toggleFavorite(movieInfo);
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Renderizar um item nos resultados da pesquisa
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={[styles.searchResultItem, { borderBottomColor: theme.colors.divider }]}
      onPress={() => handleMovieSelect(item.id)}
    >
      <View style={styles.searchResultRow}>
        {item.poster_path ? (
          <Image 
            source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }} 
            style={styles.searchResultImage} 
          />
        ) : (
          <View style={styles.searchResultNoImage}>
            <Text style={styles.searchResultNoImageText}>Sem Imagem</Text>
          </View>
        )}
        <View style={styles.searchResultInfo}>
          <Text style={[styles.searchResultTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.searchResultYear, { color: theme.colors.secondaryText }]}>
            {item.release_date ? `(${new Date(item.release_date).getFullYear()})` : ''}
          </Text>
          <Text numberOfLines={2} style={[styles.searchResultOverview, { color: theme.colors.secondaryText }]}>
            {item.overview || 'Sem descrição disponível.'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Detalhes</Text>
      </View>
        
        {/* barra de pesquisa */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.headerBackground, borderBottomColor: theme.colors.border }]}>
          <TextInput
            style={[
              styles.searchInput, 
              { 
                backgroundColor: theme.colors.inputBackground, 
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text
              }
            ]}
            placeholder="Buscar filme..."
            placeholderTextColor={theme.colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
            disabled={searchQuery.length < 2}
          >
            <Text style={[
              styles.searchButtonText, 
              searchQuery.length < 2 ? styles.searchButtonDisabled : null
            ]}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados da pesquisa */}
        {showResults && (
          <View style={[
            styles.searchResultsContainer, 
            { 
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border
            }
          ]}>
            {searching ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id.toString()}
                style={styles.searchResultsList}
              />
            ) : (
              <Text style={[styles.noResultsText, { color: theme.colors.secondaryText }]}>Nenhum filme encontrado</Text>
            )}
          </View>
        )}

        {/* Conteúdo principal */}
        {!showResults && (
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>Carregando dados do filme...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : movie ? (
            <ScrollView>
              <View style={[styles.movieCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.posterContainer}>
                  {movie.poster_path ? (
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                      style={styles.movieImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.movieImage, styles.noImageContainer]}>
                      <Text style={styles.noImageText}>Sem imagem disponível</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={[styles.favoriteButton, isTogglingFavorite && styles.favoriteButtonDisabled]}
                    onPress={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                  >
                    {isTogglingFavorite ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons 
                        name={movie && isFavorite(movie.id) ? "heart" : "heart-outline"} 
                        size={28} 
                        color={movie && isFavorite(movie.id) ? "#F44336" : "white"} 
                      />
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.movieDetails}>
                  <Text style={[styles.movieTitle, { color: theme.colors.text }]}>{movie.title}</Text>
                  <Text style={[styles.movieSynopsis, { color: theme.colors.text }]}>{movie.overview || 'Sinopse não disponível.'}</Text>
                  
                  <View style={[styles.movieStats, { 
                    backgroundColor: isDark ? '#2A2A2A' : '#f9f9f9' 
                  }]}>
                    <Text style={[styles.movieStat, { color: theme.colors.text }]}>
                      Orçamento: {movie.budget ? formatCurrency(movie.budget) : 'Não informado'}
                    </Text>
                    <Text style={[styles.movieStat, { color: theme.colors.text }]}>
                      Voto: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                    </Text>
                    <Text style={[styles.movieStat, { color: theme.colors.text }]}>
                      Duração: {movie.runtime ? `${movie.runtime} min` : 'Não informado'}
                    </Text>
                    <Text style={[styles.movieStat, { color: theme.colors.text }]}>
                      Lançamento: {formatDate(movie.release_date)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.actorsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Atores</Text>
                
                {cast.length > 0 ? (
                  cast.map((person, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.actorCard, { backgroundColor: theme.colors.card }]}
                      onPress={() => navigation.navigate('ActorProfile', { actorId: person.id })}
                    >
                      <View style={styles.actorCardContent}>
                        {person.profile_path ? (
                          <Image 
                            source={{ uri: `https://image.tmdb.org/t/p/w200${person.profile_path}` }} 
                            style={styles.actorImage} 
                          />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>{person.name.substring(0, 1)}</Text>
                          </View>
                        )}
                        <View style={styles.actorInfo}>
                          <Text style={[styles.characterName, { color: theme.colors.text }]}>
                            {person.character || 'Papel não informado'}
                          </Text>
                          <Text style={[styles.actorName, { color: theme.colors.secondaryText }]}>
                            {person.name}
                          </Text>
                        </View>
                        <Text style={[styles.chevron, { color: theme.colors.secondaryText }]}>›</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.noDataText, { color: theme.colors.secondaryText }]}>
                    Nenhuma informação de elenco disponível
                  </Text>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Nenhum filme encontrado</Text>
            </View>
          )
        )}
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 24,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  searchButton: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  // Estilos para resultados da pesquisa
  searchResultsContainer: {
    position: 'absolute',
    top: 112 + Constants.statusBarHeight,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    zIndex: 1,
    maxHeight: 300,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultImage: {
    width: 50,
    height: 75,
    borderRadius: 4,
    marginRight: 12,
  },
  searchResultNoImage: {
    width: 50,
    height: 75,
    borderRadius: 4,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultNoImageText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  searchResultYear: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  searchResultOverview: {
    fontSize: 12,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  noResultsText: {
    padding: 16,
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  // Outros estilos
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  movieCard: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  posterContainer: {
    position: 'relative',
  },
  movieImage: {
    width: '100%',
    height: 220,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonDisabled: {
    opacity: 0.7,
  },
  noImageContainer: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    fontStyle: 'italic',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  movieDetails: {
    padding: 16,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Ramabhadra_400Regular',
  },
  movieSynopsis: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  movieStats: {
    padding: 12,
    borderRadius: 8,
  },
  movieStat: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  actorsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Ramabhadra_400Regular',
  },
  actorCard: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  actorCardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  actorImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  placeholderImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  actorInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  actorName: {
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  chevron: {
    fontSize: 30,
    position: 'absolute',
    right: 15,
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
});