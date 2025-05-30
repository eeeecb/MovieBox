// FirebaseInitializer.js
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { waitForFirebase, debugFirebase } from './firebaseConfig';

export default function FirebaseInitializer({ children }) {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('🔥 Aguardando inicialização do Firebase...');
        
        // Aguardar Firebase estar pronto
        await waitForFirebase();
        
        // Debug do estado do Firebase
        if (__DEV__) {
          debugFirebase();
        }
        
        console.log('✅ Firebase inicializado com sucesso!');
        setIsFirebaseReady(true);
      } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        setError(error.message);
      }
    };

    initializeFirebase();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao inicializar Firebase</Text>
        <Text style={styles.errorDetails}>{error}</Text>
      </View>
    );
  }

  if (!isFirebaseReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Inicializando Firebase...</Text>
        <Text style={styles.subText}>Aguarde um momento</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});