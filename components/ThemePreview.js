// src/components/ThemePreview.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componente para visualizar a prévia dos temas
const ThemePreview = ({ isDark, active, onPress }) => {
  // Cores para o tema claro
  const lightThemeColors = {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    secondaryText: '#666666',
    primary: '#1E88E5',
  };
  
  // Cores para o tema escuro
  const darkThemeColors = {
    background: '#121212',
    card: '#1E1E1E',
    text: '#F5F5F5',
    secondaryText: '#AAAAAA',
    primary: '#2196F3',
  };
  
  // Escolher as cores com base no tipo de tema
  const colors = isDark ? darkThemeColors : lightThemeColors;
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: active ? colors.primary : 'transparent',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Indicador de tema ativo */}
      {active && (
        <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
      
      {/* Título da prévia */}
      <Text style={[styles.title, { color: colors.text }]}>
        {isDark ? 'Escuro' : 'Claro'}
      </Text>
      
      {/* Simulação da tela */}
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {/* Header simulado */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={[styles.headerElement, { backgroundColor: colors.primary }]} />
          <View style={[styles.headerTitle, { backgroundColor: colors.text }]} />
        </View>
        
        {/* Conteúdo simulado */}
        <View style={styles.content}>
          {/* Card simulado */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.cardHeader, { backgroundColor: colors.primary }]} />
            <View style={styles.cardContent}>
              <View style={[styles.textLine, { backgroundColor: colors.text }]} />
              <View style={[styles.textLine, { backgroundColor: colors.text, width: '70%' }]} />
              <View style={[styles.textLine, { backgroundColor: colors.secondaryText, width: '50%' }]} />
            </View>
          </View>
          
          {/* Segundo card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardContent}>
              <View style={[styles.textLine, { backgroundColor: colors.text, width: '80%' }]} />
              <View style={[styles.textLine, { backgroundColor: colors.secondaryText, width: '60%' }]} />
            </View>
          </View>
        </View>
      </View>
      
      {/* Simulação da barra de navegação */}
      <View style={[styles.navBar, { backgroundColor: colors.card }]}>
        <View style={styles.navItem}>
          <View style={[styles.navIcon, { backgroundColor: colors.primary }]} />
          <View style={[styles.navLabel, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.navItem}>
          <View style={[styles.navIcon, { backgroundColor: colors.secondaryText }]} />
          <View style={[styles.navLabel, { backgroundColor: colors.secondaryText }]} />
        </View>
        <View style={styles.navItem}>
          <View style={[styles.navIcon, { backgroundColor: colors.secondaryText }]} />
          <View style={[styles.navLabel, { backgroundColor: colors.secondaryText }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 200,
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  screen: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  header: {
    height: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  headerElement: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 4,
    gap: 3,
  },
  card: {
    borderRadius: 3,
    overflow: 'hidden',
    flex: 1,
  },
  cardHeader: {
    height: 8,
    width: '100%',
  },
  cardContent: {
    padding: 3,
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  textLine: {
    height: 2,
    borderRadius: 1,
  },
  navBar: {
    height: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  navItem: {
    alignItems: 'center',
    gap: 1,
  },
  navIcon: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  navLabel: {
    width: 10,
    height: 1,
    borderRadius: 0.5,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ThemePreview;