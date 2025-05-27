// src/screens/MovieScreen.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  FlatList,
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useMovieDetails, useMovieSearch } from '../hooks/useMovies';
import { tmdbApi } from '../services/tmdbApi';

export default function MovieScreen({ route, navigation }) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites(user?.uid);
  
  // Obter o ID do filme dos parâmetros de navegação
  const { movieId: paramMovieId } = route.params || {};
  
  // Estados para pesquisa
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  // Hooks para dados do filme e pesquisa
  const { movie, cast, loading, error, refetch } = useMovieDetails(paramMovieId);
  const { 
    searchResults, 
    loading: searching, 
    searchMovies, 
    clearSearch 
  } = useMovieSearch();

  // Efeito para pesquisar enquanto digita (com debounce)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchMovies(searchQuery);
        setShowResults(true);
      } else if (searchQuery.length === 0) {
        clearSearch();
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Função para selecionar filme da pesquisa
  const handleMovieSelect = (movieId) => {
    // Navegar para o novo filme
    navigation.push('MovieDetails', { movieId });
    // Limpar pesquisa
    setSearchQuery('');
    clearSearch();
    setShowResults(false);
  };

  // Função para alternar favorito
  const handleToggleFavorite = async () => {
    if (!movie || isTogglingFavorite || !user) {
      if (!user) {
        Alert.alert('Login necessário', 'Você precisa estar logado para adicionar favoritos');
      }
      return;
    }
    
    setIsTogglingFavorite(true);
    
    try {
      const movieInfo = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        overview: movie.overview
      };
      
      const result = await toggleFavorite(movieInfo);
      
      if (!result.success) {
        Alert.alert('Erro', result.error || 'Erro ao atualizar favoritos');
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      Alert.alert('Erro', 'Erro inesperado ao atualizar favoritos');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Funções de formatação
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
            source={{ uri: tmdbApi.getImageUrl(item.poster_path, 'w92') }} 
            style={styles.searchResultImage} 
          />
        ) : (
          <View style={styles.searchResultNoImage}>
            <Text style={styles.searchResultNoImageText}>Sem Imagem</Text>
          </View>
        )}
        <View style={styles.searchResultInfo}>
          <Text style={[styles.searchResultTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
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
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.headerBackground, 
        borderBottomColor: theme.colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Detalhes</Text>
        <View style={{ width: 28 }} />
      </View>
        
      {/* Barra de pesquisa */}
      <View style={[styles.searchContainer, { 
        backgroundColor: theme.colors.headerBackground, 
        borderBottomColor: theme.colors.border 
      }]}>
        <View style={[
          styles.searchInputContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder
          }
        ]}>
          <Ionicons name="search" size={20} color={theme.colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Buscar filme..."
            placeholderTextColor={theme.colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                clearSearch();
                setShowResults(false);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
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
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.searchingText, { color: theme.colors.secondaryText }]}>
                Pesquisando...
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id.toString()}
              style={styles.searchResultsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={[styles.noResultsText, { color: theme.colors.secondaryText }]}>
              Nenhum filme encontrado
            </Text>
          )}
        </View>
      )}

      {/* Conteúdo principal */}
      {!showResults && (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
              Carregando dados do filme...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={refetch}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : movie ? (
          <ScrollView style={styles.scrollView}>
            <View style={[styles.movieCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.posterContainer}>
                {movie.poster_path ? (
                  <Image
                    source={{ uri: tmdbApi.getImageUrl(movie.poster_path, 'w500') }}
                    style={styles.movieImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.movieImage, styles.noImageContainer]}>
                    <Text style={styles.noImageText}>Sem imagem disponível</Text>
                  </View>
                )}
                
                {/* Botão de favorito */}
                {user && (
                  <TouchableOpacity 
                    style={[styles.favoriteButton, isTogglingFavorite && styles.favoriteButtonDisabled]}
                    onPress={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                  >
                    {isTogglingFavorite ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons 
                        name={isFavorite(movie.id) ? "heart" : "heart-outline"} 
                        size={28} 
                        color={isFavorite(movie.id) ? "#F44336" : "white"} 
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.movieDetails}>
                <Text style={[styles.movieTitle, { color: theme.colors.text }]}>
                  {movie.title}
                </Text>
                <Text style={[styles.movieSynopsis, { color: theme.colors.text }]}>
                  {movie.overview || 'Sinopse não disponível.'}
                </Text>
                
                <View style={[styles.movieStats, { 
                  backgroundColor: isDark ? '#2A2A2A' : '#f9f9f9' 
                }]}>
                  <Text style={[styles.movieStat, { color: theme.colors.text }]}>
                    Orçamento: {movie.budget ? formatCurrency(movie.budget) : 'Não informado'}
                  </Text>
                  <Text style={[styles.movieStat, { color: theme.colors.text }]}>
                    Avaliação: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
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
            
            {/* Seção de atores */}
            <View style={styles.actorsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Elenco</Text>
              
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
                          source={{ uri: tmdbApi.getImageUrl(person.profile_path, 'w200') }} 
                          style={styles.actorImage} 
                        />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Text style={styles.placeholderText}>
                            {person.name.substring(0, 1)}
                          </Text>
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
                      <Ionicons name="chevron-forward" size={20} color={theme.colors.secondaryText} />
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    zIndex: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  clearButton: {
    padding: 4,
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
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  searchingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  noResultsText: {
    padding: 16,
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  // Estados de loading e erro
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
    marginBottom: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  scrollView: {
    flex: 1,
  },
  // Card do filme
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
  // Seção de atores
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
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
});