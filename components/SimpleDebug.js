// components/SimpleDebug.js - Versão melhorada com mais feedback
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { firebaseAuthService } from '../services/firebaseAuth';
import { debugLog, errorLog, successLog } from '../config/debugConfig';

export default function SimpleDebug() {
  const { theme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [firestoreStatus, setFirestoreStatus] = useState('Verificando...');
  const [isChecking, setIsChecking] = useState(false);
  const [isTestingLogout, setIsTestingLogout] = useState(false);
  const [lastAction, setLastAction] = useState('');

  useEffect(() => {
    checkFirestoreStatus();
  }, [user]);

  const checkFirestoreStatus = async () => {
    debugLog('DEBUG', 'Iniciando verificação do Firestore...');
    
    if (!user?.uid) {
      setFirestoreStatus('Usuário não logado');
      debugLog('DEBUG', 'Usuário não logado');
      return;
    }

    setIsChecking(true);
    setLastAction('Verificando Firestore...');

    try {
      debugLog('DEBUG', 'Testando acesso ao Firestore para UID:', user.uid);
      const access = await firebaseAuthService.checkFirestoreAccess(user.uid);
      debugLog('DEBUG', 'Resultado do acesso:', access);
      
      if (access.accessible) {
        const status = `✅ Firestore OK (doc ${access.exists ? 'existe' : 'não existe'})`;
        setFirestoreStatus(status);
        setLastAction('✅ Verificação concluída');
        debugLog('DEBUG', 'Firestore acessível:', access);
      } else {
        let status = '';
        if (access.error === 'permission-denied') {
          status = '❌ Firestore: Erro de permissão - Configure as regras!';
        } else {
          status = `❌ Firestore: ${access.error}`;
        }
        setFirestoreStatus(status);
        setLastAction('❌ Erro na verificação');
        debugLog('DEBUG', 'Firestore inacessível:', access);
      }
    } catch (error) {
      const status = `❌ Erro: ${error.message}`;
      setFirestoreStatus(status);
      setLastAction('❌ Erro na verificação');
      errorLog('DEBUG', 'Erro ao verificar Firestore:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const testLogout = async () => {
    debugLog('DEBUG', 'Iniciando teste de logout...');
    setIsTestingLogout(true);
    setLastAction('Testando logout...');

    try {
      debugLog('DEBUG', 'Chamando função de logout...');
      const result = await logout();
      debugLog('DEBUG', 'Resultado do logout:', result);
      
      if (result.success) {
        setLastAction('✅ Logout funcionou!');
        successLog('DEBUG', '✅ Logout bem-sucedido');
        
        // Mostrar alert E log
        Alert.alert(
          'Teste de Logout',
          '✅ Logout funcionou perfeitamente!',
          [{ text: 'OK' }]
        );
      } else {
        setLastAction(`❌ Erro no logout: ${result.error}`);
        errorLog('DEBUG', '❌ Erro no logout:', result.error);
        
        Alert.alert(
          'Teste de Logout',
          `❌ Erro no logout: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      const errorMsg = `❌ Exceção: ${error.message}`;
      setLastAction(errorMsg);
      errorLog('DEBUG', 'Exceção no logout:', error);
      
      Alert.alert(
        'Teste de Logout',
        `❌ Erro inesperado: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsTestingLogout(false);
      
      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
        setLastAction('');
      }, 3000);
    }
  };

  const handleVerifyPress = () => {
    debugLog('DEBUG', 'Botão Verificar pressionado');
    checkFirestoreStatus();
  };

  const handleLogoutPress = () => {
    debugLog('DEBUG', 'Botão Testar Logout pressionado');
    testLogout();
  };

  // Só mostrar em desenvolvimento
  if (!__DEV__) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        🔍 Debug Rápido
      </Text>
      
      <Text style={[styles.info, { color: theme.colors.text }]}>
        Auth: {isAuthenticated ? '✅ Logado' : '❌ Não logado'}
      </Text>
      
      <Text style={[styles.info, { color: theme.colors.text }]}>
        Email: {user?.email || 'N/A'}
      </Text>
      
      <Text style={[styles.info, { color: theme.colors.text }]}>
        {firestoreStatus}
      </Text>
      
      {lastAction && (
        <Text style={[styles.lastAction, { color: theme.colors.primary }]}>
          {lastAction}
        </Text>
      )}
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[
            styles.button, 
            { backgroundColor: isChecking ? '#999' : theme.colors.primary }
          ]}
          onPress={handleVerifyPress}
          disabled={isChecking}
        >
          <Text style={styles.buttonText}>
            {isChecking ? 'Verificando...' : 'Verificar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            { backgroundColor: isTestingLogout ? '#999' : theme.colors.error }
          ]}
          onPress={handleLogoutPress}
          disabled={isTestingLogout}
        >
          <Text style={styles.buttonText}>
            {isTestingLogout ? 'Testando...' : 'Testar Logout'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {firestoreStatus.includes('permissão') && (
        <Text style={[styles.warning, { color: theme.colors.error }]}>
          ⚠️ Configure as regras do Firestore no Firebase Console!
        </Text>
      )}
      
      <Text style={[styles.hint, { color: theme.colors.secondaryText }]}>
        💡 Verifique o console do Metro para logs detalhados
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  lastAction: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 80,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  warning: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hint: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});