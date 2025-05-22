import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';

export default function FavoritesScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { favorites, removeFavorite } = useFavorites();
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [removingId, setRemovingId] = React.useState(null);
  
  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Função para remover um favorito
  const handleRemoveFavorite = async (movieId) => {
    setRemovingId(movieId);
    setIsRemoving(true);
    
    try {
      await removeFavorite(movieId);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    } finally {
      setIsRemoving(false);
      setRemovingId(null);
    }
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
            source={{ uri: `https://image.tmdb.org/t/p/w154${item.poster_path}` }} 
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
        </View>
        
        <TouchableOpacity 
          style={[
            styles.removeButton, 
            isRemoving && removingId === item.id ? styles.removingButton : null
          ]}
          onPress={() => handleRemoveFavorite(item.id)}
          disabled={isRemoving}
        >
          {isRemoving && removingId === item.id ? (
            <ActivityIndicator size="small" color={theme.colors.text} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={theme.colors.text} />
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
    </View>
  );
  
  // Função para renderizar quando a lista está vazia
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={theme.colors.secondaryText} />
      <Text style={[styles.emptyText, { color: theme.colors.secondaryText }]}>
        Você ainda não adicionou nenhum filme aos favoritos
      </Text>
      <TouchableOpacity 
        style={[styles.browseButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('MoviesTab')}
      >
        <Text style={styles.browseButtonText}>Ver filmes</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={[styles.header, { 
        backgroundColor: theme.colors.headerBackground, 
        borderBottomColor: theme.colors.border 
      }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Favoritos</Text>
      </View>
      
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
      />
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
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  favoriteItem: {
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
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
    justifyContent: 'center',
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Ramabhadra_400Regular',
  },
  favoriteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  removingButton: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
});