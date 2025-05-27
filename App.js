// App.js
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFonts, EncodeSansExpanded_400Regular, EncodeSansExpanded_500Medium } from '@expo-google-fonts/encode-sans-expanded';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { Exo_700Bold } from '@expo-google-fonts/exo';

// Providers
import { ThemeProvider } from './contexts/ThemeContext';

// Navigation
import MainNavigator from './navigation/MainNavigator';

export default function App() {
  // Carregar fontes
  const [fontsLoaded] = useFonts({
    Exo_700Bold,
    EncodeSansExpanded_400Regular,
    EncodeSansExpanded_500Medium,
    Nunito_400Regular
  });

  // Tela de loading enquanto as fontes carregam
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>Carregando fontes...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <MainNavigator />
    </ThemeProvider>
  );
}