import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShimmerBox, ShimmerLine, ShimmerCircle } from './ShimmerBase';
import { useTheme } from '../contexts/ThemeContext';

export const ShimmerMovieCard = ({ style }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.movieCard, style]}>
      {/* Poster */}
      <ShimmerBox 
        width="100%" 
        height={225} 
        borderRadius={8}
        duration={1800}
      />
      
      {/* Info section */}
      <View style={[styles.movieInfo, { backgroundColor: theme.colors.card }]}>
        {/* Título */}
        <ShimmerLine 
          width="85%" 
          height={14} 
          duration={1600}
          style={{ marginBottom: 6 }}
        />
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <ShimmerCircle size={16} duration={1700} />
          <ShimmerLine 
            width={40} 
            height={12} 
            duration={1650}
            style={{ marginLeft: 4 }}
          />
        </View>
      </View>
    </View>
  );
};

export const ShimmerSearchResult = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.searchResultItem, { 
      backgroundColor: theme.colors.card,
      borderBottomColor: theme.colors.divider 
    }]}>
      <View style={styles.searchResultRow}>
        {/* Poster pequeno */}
        <ShimmerBox 
          width={50} 
          height={75} 
          borderRadius={4}
          duration={1600}
        />
        
        <View style={styles.searchResultInfo}>
          {/* Título */}
          <ShimmerLine 
            width="80%" 
            height={16} 
            duration={1700}
            style={{ marginBottom: 4 }}
          />
          {/* Ano */}
          <ShimmerLine 
            width="30%" 
            height={14} 
            duration={1800}
            style={{ marginBottom: 4 }}
          />
          {/* Overview */}
          <ShimmerLine 
            width="95%" 
            height={12} 
            duration={1500}
            style={{ marginBottom: 2 }}
          />
          <ShimmerLine 
            width="70%" 
            height={12} 
            duration={1650}
          />
        </View>
      </View>
    </View>
  );
};

export const ShimmerActorCard = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.actorCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.actorCardContent}>
        {/* Avatar do ator */}
        <ShimmerCircle 
          size={45} 
          duration={1600}
        />
        
        <View style={styles.actorInfo}>
          {/* Nome do personagem */}
          <ShimmerLine 
            width="70%" 
            height={16} 
            duration={1700}
            style={{ marginBottom: 4 }}
          />
          {/* Nome do ator */}
          <ShimmerLine 
            width="85%" 
            height={14} 
            duration={1800}
          />
        </View>
        
        {/* Ícone de seta */}
        <ShimmerCircle size={20} duration={1650} />
      </View>
    </View>
  );
};

export const ShimmerActorProfile = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.actorCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.actorHeader}>
        {/* Foto grande do ator */}
        <ShimmerBox 
          width={100} 
          height={150} 
          borderRadius={8}
          duration={1800}
        />
        
        <View style={styles.actorHeaderInfo}>
          {/* Nome do ator */}
          <ShimmerLine 
            width="90%" 
            height={22} 
            duration={1600}
            style={{ marginBottom: 8 }}
          />
          {/* Popularidade */}
          <ShimmerLine 
            width="60%" 
            height={16} 
            duration={1700}
          />
        </View>
      </View>
      
      {/* Biografia placeholder */}
      <View style={styles.actorBio}>
        {Array.from({ length: 4 }).map((_, index) => (
          <ShimmerLine
            key={index}
            width={index === 3 ? "70%" : "100%"}
            height={16}
            duration={1500 + (index * 100)}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>
      
      {/* Detalhes do ator */}
      <View style={[styles.actorDetails, { 
        backgroundColor: theme.isDark ? '#2A2A2A' : '#f9f9f9' 
      }]}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.detailRow}>
            <ShimmerLine 
              width={120} 
              height={16} 
              duration={1600 + (index * 150)}
              style={{ marginBottom: 8 }}
            />
            <ShimmerLine 
              width="60%" 
              height={16} 
              duration={1700 + (index * 150)}
              style={{ marginBottom: 8 }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export const ShimmerMovieItem = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.movieItem, { backgroundColor: theme.colors.card }]}>
      <View style={styles.movieRow}>
        {/* Poster do filme */}
        <ShimmerBox 
          width={60} 
          height={90} 
          borderRadius={4}
          duration={1600}
        />
        
        <View style={styles.movieInfo}>
          {/* Título do filme */}
          <ShimmerLine 
            width="85%" 
            height={16} 
            duration={1700}
            style={{ marginBottom: 6 }}
          />
          {/* Data */}
          <ShimmerLine 
            width="40%" 
            height={14} 
            duration={1800}
            style={{ marginBottom: 4 }}
          />
          {/* Personagem */}
          <ShimmerLine 
            width="70%" 
            height={14} 
            duration={1650}
          />
        </View>
        
        {/* Seta */}
        <ShimmerCircle size={20} duration={1750} />
      </View>
    </View>
  );
};

export const ShimmerFavoriteItem = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.favoriteItem, { backgroundColor: theme.colors.card }]}>
      <View style={styles.favoriteRow}>
        {/* Poster */}
        <ShimmerBox 
          width={80} 
          height={120} 
          borderRadius={6}
          duration={1600}
        />
        
        <View style={styles.favoriteInfo}>
          {/* Título */}
          <ShimmerLine 
            width="90%" 
            height={18} 
            duration={1700}
            style={{ marginBottom: 6 }}
          />
          
          {/* Meta info (rating + year) */}
          <View style={styles.favoriteMeta}>
            <View style={styles.ratingContainer}>
              <ShimmerCircle size={16} duration={1800} />
              <ShimmerLine 
                width={35} 
                height={14} 
                duration={1650}
                style={{ marginLeft: 4 }}
              />
            </View>
            <ShimmerLine 
              width={50} 
              height={14} 
              duration={1750}
              style={{ marginLeft: 16 }}
            />
          </View>
          
          {/* Overview */}
          <ShimmerLine 
            width="100%" 
            height={13} 
            duration={1600}
            style={{ marginTop: 8, marginBottom: 2 }}
          />
          <ShimmerLine 
            width="75%" 
            height={13} 
            duration={1700}
          />
        </View>
        
        {/* Botão de remover */}
        <ShimmerCircle size={40} duration={1800} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  movieInfo: {
    padding: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  
  actorCard: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    padding: 12,
  },
  actorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  
  actorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actorHeaderInfo: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  actorBio: {
    marginBottom: 16,
  },
  actorDetails: {
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  favoriteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
});