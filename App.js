import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFonts, EncodeSansExpanded_400Regular, EncodeSansExpanded_500Medium } from '@expo-google-fonts/encode-sans-expanded';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { Exo_700Bold } from '@expo-google-fonts/exo';

import FirebaseInitializer from './FirebaseInitializer';
import { ThemeProvider } from './contexts/ThemeContext';
import MainNavigator from './navigation/MainNavigator';

const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#ffffff'
  }}>
    <ActivityIndicator size="large" color="#1E88E5" />
    <Text style={{ 
      marginTop: 16, 
      fontSize: 16,
      color: '#333',
      fontWeight: '500'
    }}>
      Carregando fontes...
    </Text>
  </View>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    Exo_700Bold,
    EncodeSansExpanded_400Regular,
    EncodeSansExpanded_500Medium,
    Nunito_400Regular
  });

  if (!fontsLoaded) return <LoadingScreen />;

  return (
    <FirebaseInitializer>
      <ThemeProvider>
        <MainNavigator />
      </ThemeProvider>
    </FirebaseInitializer>
  );
}