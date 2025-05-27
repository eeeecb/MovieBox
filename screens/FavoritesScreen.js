// src/screens/FavoritesScreen.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { tmdbApi } from '../services/tmdbApi';

export default function FavoritesScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites(user?.uid);
  
  const [removingId, setRemovingId] = useState(null);
  
  // Função para remover um favorito
  const handleRemoveFavorite = async (movieId, movieTitle) => {
    Alert.alert(
      'Remover Favorito',
      `Tem certeza que deseja remover "${movieTitle}" dos seus favoritos?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(movieId);
            
            try {
              const result = await removeFavorite(movieId);
              
              if (!result.success) {
                Alert.alert('Erro', result.error || 'Erro ao remover favorito');
              }
            } catch (error) {
              console.error('Erro ao remover favorito:', error);
              Alert.alert('Erro', 'Erro inesperado ao remover favorito');
            } finally {
              setRemovingId(null);
            }
          }
        }
      ]
    );
  };
  
  // Função para renderizar um filme favorito
  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.favoriteItem, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
    >
      <View style={styles.favoriteRow}>
        {item.poster_path ? (
          <Image 
            source={{ uri: tmdbApi.getImageUrl(item.poster_path, 'w154') }} 
            style={styles.posterImage} 
          />
        ) : (
          <View style={styles.noPosterImage}>
            <Text style={styles.noPosterText}>Sem Imagem</Text>
          </View>
        )}
        
        <View style={styles.favoriteInfo}>
          <Text style={[styles.favoriteTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          
          <View style={styles.favoriteMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={[styles.ratingText, { color: theme.colors.secondaryText }]}>
                {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
              </Text>
            </View>
            
            <Text style={[styles.yearText, { color: theme.colors.secondaryText }]}>
              {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
            </Text>
          </View>
          
          {/* Sinopse curta */}
          {item.overview && (
            <Text 
              style={[styles.overviewText, { color: theme.colors.secondaryText }]}
              numberOfLines={2}
            >
              {item.overview}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.removeButton, 
            removingId === item.id ? styles.removingButton : null
          ]}
          onPress={() => handleRemoveFavorite(item.id, item.title)}
          disabled={removingId === item.id}
        >
          {removingId === item.id ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  // Função para renderizar o header da lista
  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={[styles.listTitle, { color: theme.colors.text }]}>
        Seus Filmes Favoritos
      </Text>
      <Text style={[styles.listSubtitle, { color: theme.colors.secondaryText }]}>
        {favorites.length} {favorites.length === 1 ? 'filme' : 'filmes'} salvos
      </Text>
    </View>
  );
  
  // Função para renderizar quando não está autenticado
  const renderNotAuthenticated = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="person-outline" size={80} color={theme.colors.secondaryText} />
      <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
        Você precisa estar logado para ver seus favoritos
      </Text>
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.actionButtonText}>Fazer Login</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Função para renderizar quando a lista está vazia
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={theme.colors.secondaryText} />
      <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
        Você ainda não adicionou nenhum filme aos favoritos
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.secondaryText }]}>
        Explore filmes e toque no coração para salvá-los aqui
      </Text>
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Main', { screen: 'MoviesTab' })}
      >
        <Text style={styles.actionButtonText}>Descobrir Filmes</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Função para renderizar estado de loading
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
        Carregando favoritos...
      </Text>
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
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
          Favoritos
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Conteúdo */}
      {!isAuthenticated ? (
        renderNotAuthenticated()
      ) : loading ? (
        renderLoading()
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            favorites.length === 0 && { flex: 1 }
          ]}
          ListHeaderComponent={favorites.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Nunito_400Regular',
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Nunito_400Regular',
  },
  listSubtitle: {
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  favoriteItem: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  favoriteRow: {
    flexDirection: 'row',
    padding: 12,
  },
  posterImage: {
    width: 80,
    height: 120,
    borderRadius: 6,
  },
  noPosterImage: {
    width: 80,
    height: 120,
    borderRadius: 6,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPosterText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  favoriteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'Nunito_400Regular',
  },
  favoriteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  yearText: {
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  overviewText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  removingButton: {
    opacity: 0.7,
  },
  separator: {
    height: 12,
  },
  // Estados vazios e loading
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
});