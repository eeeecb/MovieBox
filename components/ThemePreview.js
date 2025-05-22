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
      
      {/* Simulação da barra de navegação */}
      <View style={[styles.navBar, { backgroundColor: colors.card }]}>
        <View style={styles.navItem}>
          <View style={[styles.navIcon, { backgroundColor: colors.secondaryText }]} />
          <View style={[styles.navLabel, { backgroundColor: colors.secondaryText }]} />
        </View>
        <View style={styles.navItem}>
          <View style={[styles.navIcon, { backgroundColor: colors.primary }]} />
          <View style={[styles.navLabel, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.navItem}>
          <View style={[styles.navIcon, { backgroundColor: colors.secondaryText }]} />
          <View style={[styles.navLabel, { backgroundColor: colors.secondaryText }]} />
        </View>
      </View>
      
      {/* Simulação do conteúdo da tela */}
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]} />
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.cardHeader, { backgroundColor: colors.primary }]} />
            <View style={[styles.cardContent, { backgroundColor: colors.card }]}>
              <View style={[styles.textLine, { backgroundColor: colors.text }]} />
              <View style={[styles.textLine, { backgroundColor: colors.text, width: '70%' }]} />
              <View style={[styles.textLine, { backgroundColor: colors.secondaryText, width: '50%' }]} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 200,
    borderRadius: 10,
    padding: 8,
    borderWidth: 2,
    overflow: 'hidden',
    marginHorizontal: 8,
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
  },
  header: {
    height: 20,
    width: '100%',
  },
  content: {
    padding: 4,
  },
  card: {
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  cardHeader: {
    height: 15,
    width: '100%',
  },
  cardContent: {
    padding: 4,
  },
  textLine: {
    height: 3,
    borderRadius: 1.5,
    marginVertical: 2,
  },
  navBar: {
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  navLabel: {
    width: 15,
    height: 2,
    borderRadius: 1,
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
  },
});

export default ThemePreview;