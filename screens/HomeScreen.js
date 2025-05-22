import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// O correto seria usar um .env, mas para o propósito do projeto isso vai servir
const TMDB_API_KEY = "96b2227903ddc79337303ec7ebeb4b1e";

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Obter dimensões da tela
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar filmes em cartaz
        const nowPlayingResponse = await fetch(
          `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`
        );
        const nowPlayingData = await nowPlayingResponse.json();
        setNowPlayingMovies(nowPlayingData.results || []);
        
        // Buscar filmes populares
        const popularResponse = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`
        );
        const popularData = await popularResponse.json();
        setPopularMovies(popularData.results || []);
        
        // Buscar filmes mais bem avaliados
        const topRatedResponse = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`
        );
        const topRatedData = await topRatedResponse.json();
        setTopRatedMovies(topRatedData.results || []);
      } catch (err) {
        console.error('Erro ao carregar filmes:', err);
        setError('Falha ao carregar dados de filmes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

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
        setSearchResults(searchData.results.slice(0, 20)); // Limitamos a 20 resultados
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(true);
      }
    } catch (err) {
      setError('Erro ao buscar filmes');
      console.error('Error searching movies:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

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

  // Função para limpar a pesquisa
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Navegação para detalhes do filme
  const navigateToMovieDetails = (movieId) => {
    // Se estiver pesquisando, limpe a pesquisa ao navegar
    clearSearch();
    navigation.navigate('Movies', { movieId });
  };

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigateToMovieDetails(item.id)}
    >
      {item.poster_path ? (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
          style={styles.posterImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.posterImage, styles.noPosterContainer]}>
          <Text style={styles.noPosterText}>Sem imagem</Text>
        </View>
      )}
      <View style={[styles.movieInfo, { backgroundColor: theme.colors.card }]}>
        <Text 
          style={[styles.movieTitle, { color: theme.colors.text }]} 
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text style={[styles.ratingText, { color: theme.colors.secondaryText }]}>
            {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={[styles.searchResultItem, { 
        borderBottomColor: theme.colors.divider, 
        backgroundColor: theme.colors.card 
      }]}
      onPress={() => navigateToMovieDetails(item.id)}
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

  const renderMovieSection = (title, data) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.movieList}
        />
      ) : (
        <Text style={[styles.noDataText, { color: theme.colors.secondaryText }]}>
          Nenhum filme disponível
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>MovieBox</Text>
      </View>
      
      {/* Barra de pesquisa - Sempre visível */}
      <View style={[styles.searchContainer, { 
        backgroundColor: theme.colors.headerBackground, 
        borderBottomColor: theme.colors.border,
        zIndex: 10 // Garante que a barra de pesquisa fique acima
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
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Conteúdo principal ou resultados de pesquisa */}
      {showResults ? (
        // Resultados da pesquisa em uma FlatList completa
        <View style={{ flex: 1 }}>
          {searching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.searchingText, { color: theme.colors.secondaryText }]}>
                Pesquisando...
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.searchResultsContainer}
              ListHeaderComponent={
                <View style={styles.searchHeaderContainer}>
                  <Text style={[styles.searchResultsTitle, { color: theme.colors.text }]}>
                    Resultados para "{searchQuery}"
                  </Text>
                </View>
              }
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color={theme.colors.secondaryText} />
              <Text style={[styles.noResultsText, { color: theme.colors.secondaryText }]}>
                Nenhum filme encontrado para "{searchQuery}"
              </Text>
              <TouchableOpacity 
                style={[styles.backToHomeButton, { backgroundColor: theme.colors.primary }]}
                onPress={clearSearch}
              >
                <Text style={styles.backToHomeButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // Conteúdo normal da tela inicial
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
              Carregando filmes...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.replace('Home')}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {renderMovieSection('Em Cartaz', nowPlayingMovies)}
            {renderMovieSection('Populares', popularMovies)}
            {renderMovieSection('Mais Bem Avaliados', topRatedMovies)}
          </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Exo_700Bold',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    elevation: 3, // Adiciona sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  // Estilo para a seção de pesquisa
  searchHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  backToHomeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backToHomeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  searchResultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  searchResultItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 12,
  },
  searchResultNoImage: {
    width: 60,
    height: 90,
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
    fontSize: 13,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  // Container para quando está pesquisando
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  // Container para quando não há resultados
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  scrollView: {
    flex: 1,
  },
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
    marginBottom: 20,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
    fontFamily: 'Ramabhadra_400Regular',
  },
  movieList: {
    paddingLeft: 16,
  },
  movieCard: {
    width: 150,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  posterImage: {
    width: '100%',
    height: 225,
    backgroundColor: '#ddd',
  },
  noPosterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPosterText: {
    color: '#666',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  movieInfo: {
    padding: 10,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    height: 40,
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  noDataText: {
    padding: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
});