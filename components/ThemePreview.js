import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_COLORS = {
  light: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    secondaryText: '#666666',
    primary: '#1E88E5',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#F5F5F5',
    secondaryText: '#AAAAAA',
    primary: '#2196F3',
  }
};

const PreviewElement = ({ style }) => <View style={style} />;

const CardContent = ({ colors }) => (
  <View style={styles.cardContent}>
    <View style={[styles.textLine, { backgroundColor: colors.text }]} />
    <View style={[styles.textLine, { backgroundColor: colors.text, width: '70%' }]} />
    <View style={[styles.textLine, { backgroundColor: colors.secondaryText, width: '50%' }]} />
  </View>
);

const NavItem = ({ colors, isPrimary }) => (
  <View style={styles.navItem}>
    <PreviewElement style={[
      styles.navIcon, 
      { backgroundColor: isPrimary ? colors.primary : colors.secondaryText }
    ]} />
    <PreviewElement style={[
      styles.navLabel, 
      { backgroundColor: isPrimary ? colors.primary : colors.secondaryText }
    ]} />
  </View>
);

const ThemePreview = ({ isDark, active, onPress }) => {
  const colors = THEME_COLORS[isDark ? 'dark' : 'light'];
  const themeLabel = isDark ? 'Escuro' : 'Claro';
  
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
      {active && (
        <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
      
      <Text style={[styles.title, { color: colors.text }]}>
        {themeLabel}
      </Text>
      
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <PreviewElement style={[styles.headerElement, { backgroundColor: colors.primary }]} />
          <PreviewElement style={[styles.headerTitle, { backgroundColor: colors.text }]} />
        </View>
        
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <PreviewElement style={[styles.cardHeader, { backgroundColor: colors.primary }]} />
            <CardContent colors={colors} />
          </View>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardContent}>
              <View style={[styles.textLine, { backgroundColor: colors.text, width: '80%' }]} />
              <View style={[styles.textLine, { backgroundColor: colors.secondaryText, width: '60%' }]} />
            </View>
          </View>
        </View>
      </View>
      
      <View style={[styles.navBar, { backgroundColor: colors.card }]}>
        <NavItem colors={colors} isPrimary={true} />
        <NavItem colors={colors} isPrimary={false} />
        <NavItem colors={colors} isPrimary={false} />
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ThemePreview;