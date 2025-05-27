// src/screens/HomeScreen.js
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useMovies, useMovieSearch } from '../hooks/useMovies';
import { tmdbApi } from '../services/tmdbApi';

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { 
    nowPlayingMovies, 
    popularMovies, 
    topRatedMovies, 
    loading, 
    error, 
    refreshMovies 
  } = useMovies();
  
  const {
    searchResults,
    loading: searching,
    searchMovies,
    clearSearch
  } = useMovieSearch();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Debounce da pesquisa
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

  const handleMoviePress = (movieId) => {
    // Limpar pesquisa ao navegar
    if (showResults) {
      setSearchQuery('');
      clearSearch();
      setShowResults(false);
    }
    navigation.navigate('MovieDetails', { movieId });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
    setShowResults(false);
  };

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => handleMoviePress(item.id)}
    >
      {item.poster_path ? (
        <Image
          source={{ uri: tmdbApi.getImageUrl(item.poster_path, 'w300') }}
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
      onPress={() => handleMoviePress(item.id)}
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
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.headerBackground, 
        borderBottomColor: theme.colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>MovieBox</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { 
        backgroundColor: theme.colors.headerBackground, 
        borderBottomColor: theme.colors.border,
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
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Content */}
      {showResults ? (
        // Search Results
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
            </View>
          )}
        </View>
      ) : (
        // Main Content
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
              onPress={refreshMovies}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Exo_700Bold',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
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
  // Search Results
  searchHeaderContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
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
  // Loading states
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
  // Movie sections
  scrollView: {
    flex: 1,
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