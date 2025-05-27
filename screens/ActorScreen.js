// src/screens/ActorScreen.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { tmdbApi } from '../services/tmdbApi';

// Hook personalizado para dados do ator
const useActorDetails = (actorId) => {
  const [actorDetails, setActorDetails] = useState(null);
  const [actorFilmography, setActorFilmography] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!actorId) {
      setLoading(false);
      return;
    }

    const fetchActorData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [actorResult, moviesResult] = await Promise.all([
          tmdbApi.getActorDetails(actorId),
          tmdbApi.getActorMovies(actorId)
        ]);

        if (actorResult.success) {
          setActorDetails(actorResult.data);
        } else {
          setError(actorResult.error);
        }

        if (moviesResult.success) {
          // Ordenar por data de lançamento e pegar os 10 mais recentes
          const sortedMovies = moviesResult.data
            .sort((a, b) => new Date(b.release_date || '1900') - new Date(a.release_date || '1900'))
            .slice(0, 10);
          setActorFilmography(sortedMovies);
        }
      } catch (err) {
        setError('Erro ao buscar dados do ator');
        console.error('Error fetching actor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActorData();
  }, [actorId]);

  const refetch = () => {
    if (actorId) {
      fetchActorData();
    }
  };

  return {
    actorDetails,
    actorFilmography,
    loading,
    error,
    refetch
  };
};

export default function ActorScreen({ route, navigation }) {
  const { theme, isDark } = useTheme();
  
  // ID do ator recebido da tela anterior
  const { actorId } = route.params || { actorId: 3 };
  
  // Hook personalizado para dados do ator
  const { 
    actorDetails, 
    actorFilmography, 
    loading, 
    error, 
    refetch 
  } = useActorDetails(actorId);

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Descrições extensas para atores (caso a biografia da API não esteja disponível)
  const getActorDescription = () => {
    // Se temos uma descrição da API, usamos ela
    if (actorDetails && actorDetails.biography) {
      return actorDetails.biography;
    }
    
    // Descrições de backup para alguns atores famosos
    const descriptions = {
      3: "Audrey Justine Tautou, nascida em 9 de agosto de 1976, é uma renomada atriz francesa que ganhou reconhecimento internacional por seu papel como Amélie Poulain no filme 'O Fabuloso Destino de Amélie Poulain' (2001). Sua interpretação encantadora e única capturou corações em todo o mundo. Também atuou no filme 'O Código Da Vinci' (2006) ao lado de Tom Hanks, e foi garota-propaganda da Chanel, representando a icônica fragrância Chanel Nº 5 após Nicole Kidman.",
      6193: "Leonardo Wilhelm DiCaprio, nascido em 11 de novembro de 1974 em Los Angeles, é um dos atores mais talentosos e versáteis de sua geração. Além de sua impressionante carreira como ator, DiCaprio é um ambientalista apaixonado e filantropo dedicado. Ganhou o Oscar de Melhor Ator por 'O Regresso' (2015) após várias indicações. Sua colaboração frequente com o diretor Martin Scorsese resultou em filmes aclamados como 'O Lobo de Wall Street', 'A Origem' e 'Os Infiltrados'.",
      112: "Cate Blanchett, nascida em 14 de maio de 1969 em Melbourne, Austrália, é uma das atrizes mais aclamadas de sua geração, conhecida por sua versatilidade e forte presença na tela. Vencedora de dois Oscars por 'O Aviador' e 'Blue Jasmine', seus papéis memoráveis incluem a rainha Elizabeth I, Galadriel em 'O Senhor dos Anéis', e diversos personagens em filmes de diretores renomados como Martin Scorsese, Steven Spielberg e Wes Anderson.",
      74568: "Margot Robbie, nascida em 2 de julho de 1990 em Queensland, Austrália, rapidamente ascendeu em Hollywood após sua atuação em 'O Lobo de Wall Street' (2013). Ganhou notoriedade por seus papéis complexos em filmes como 'Eu, Tonya' e por sua interpretação de Arlequina nos filmes do universo DC. Além de atuar, fundou a produtora LuckyChap Entertainment, com o objetivo de promover projetos liderados por mulheres na indústria do cinema.",
      287: "William Bradley Pitt, nascido em 18 de dezembro de 1963 em Oklahoma, é um ator e produtor cinematográfico americano que conquistou fama mundial por sua versatilidade e aparência carismática. Vencedor do Oscar por sua atuação em 'Era Uma Vez em Hollywood' (2019) e como produtor de '12 Anos de Escravidão' (2013). Foi casado com as atrizes Jennifer Aniston e Angelina Jolie, com quem tem seis filhos. Além de atuar, fundou a produtora Plan B Entertainment, responsável por diversos filmes aclamados pela crítica."
    };
    
    return descriptions[actorId] || "Informações biográficas não disponíveis.";
  };
  
  // Renderizar um item de filmografia
  const renderFilmographyItem = (movie) => (
    <TouchableOpacity 
      key={movie.id} 
      style={[styles.movieItem, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('MovieDetails', { movieId: movie.id })}
    >
      <View style={styles.movieRow}>
        {movie.poster_path ? (
          <Image 
            source={{ uri: tmdbApi.getImageUrl(movie.poster_path, 'w92') }} 
            style={styles.moviePoster} 
          />
        ) : (
          <View style={styles.noMoviePoster}>
            <Text style={styles.noMoviePosterText}>Sem Imagem</Text>
          </View>
        )}
        <View style={styles.movieInfo}>
          <Text style={[styles.movieTitle, { color: theme.colors.text }]}>
            {movie.title}
          </Text>
          <Text style={[styles.movieDate, { color: theme.colors.secondaryText }]}>
            {formatDate(movie.release_date)}
          </Text>
          <Text style={[styles.movieCharacter, { color: theme.colors.secondaryText }]}>
            {movie.character ? `Como: ${movie.character}` : 'Papel não informado'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.secondaryText} />
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
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
          Perfil do Ator
        </Text>
        <View style={{ width: 28 }} />
      </View>
      
      {/* Conteúdo */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
            Carregando perfil do ator...
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
      ) : actorDetails ? (
        <ScrollView style={styles.scrollView}>
          {/* Card do ator */}
          <View style={[styles.actorCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.actorHeader}>
              {actorDetails.profile_path ? (
                <Image 
                  source={{ uri: tmdbApi.getImageUrl(actorDetails.profile_path, 'w300') }} 
                  style={styles.actorProfileImage} 
                />
              ) : (
                <View style={styles.noActorImage}>
                  <Text style={styles.noActorImageText}>
                    {actorDetails.name?.substring(0, 1)}
                  </Text>
                </View>
              )}
              
              <View style={styles.actorHeaderInfo}>
                <Text style={[styles.actorProfileName, { color: theme.colors.text }]}>
                  {actorDetails.name}
                </Text>
                <Text style={[styles.actorPopularity, { color: theme.colors.secondaryText }]}>
                  Popularidade: {actorDetails.popularity?.toFixed(1)}
                </Text>
              </View>
            </View>
            
            {/* Biografia */}
            <View style={styles.actorBio}>
              <Text style={[styles.actorBioText, { color: theme.colors.text }]}>
                {getActorDescription()}
              </Text>
            </View>
            
            {/* Detalhes do ator */}
            <View style={[styles.actorDetails, { 
              backgroundColor: isDark ? '#2A2A2A' : '#f9f9f9' 
            }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                  Sexo:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {actorDetails.gender === 1 ? 'Feminino' : 'Masculino'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                  Data de Nascimento:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatDate(actorDetails.birthday)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                  Local de Nascimento:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {actorDetails.place_of_birth || 'Não informado'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Seção de filmografia */}
          <View style={styles.filmographySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Filmes
            </Text>
            
            {actorFilmography.length > 0 ? (
              actorFilmography.map(movie => renderFilmographyItem(movie))
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.secondaryText }]}>
                Nenhuma informação de filmografia disponível
              </Text>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nenhuma informação do ator encontrada</Text>
        </View>
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
    fontFamily: 'Nunito_400Regular',
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
  actorCard: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    padding: 16,
  },
  actorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actorProfileImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  noActorImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noActorImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#666',
  },
  actorHeaderInfo: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  actorProfileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Nunito_400Regular',
  },
  actorPopularity: {
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  actorBio: {
    marginBottom: 16,
  },
  actorBioText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  actorDetails: {
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 150,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  filmographySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Nunito_400Regular',
  },
  movieItem: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  movieRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 4,
  },
  noMoviePoster: {
    width: 60,
    height: 90,
    borderRadius: 4,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoviePosterText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito_400Regular',
  },
  movieDate: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  movieCharacter: {
    fontSize: 14,
    fontStyle: 'italic',
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