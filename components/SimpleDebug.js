import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { firebaseAuthService } from '../services/firebaseAuth';
import { debugLog, errorLog, successLog } from '../config/debugConfig';

const StatusText = ({ theme, children }) => (
  <Text style={[styles.info, { color: theme.colors.text }]}>
    {children}
  </Text>
);

const ActionButton = ({ theme, onPress, disabled, isLoading, color, children }) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      { backgroundColor: disabled ? '#999' : color || theme.colors.primary }
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>
      {isLoading ? 'Processando...' : children}
    </Text>
  </TouchableOpacity>
);

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

  const setActionWithTimeout = (message, timeout = 3000) => {
    setLastAction(message);
    setTimeout(() => setLastAction(''), timeout);
  };

  const getFirestoreStatusMessage = (access) => {
    if (access.accessible) {
      return `✅ Firestore OK (doc ${access.exists ? 'existe' : 'não existe'})`;
    }
    
    return access.error === 'permission-denied' 
      ? '❌ Firestore: Erro de permissão - Configure as regras!'
      : `❌ Firestore: ${access.error}`;
  };

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
      
      const status = getFirestoreStatusMessage(access);
      setFirestoreStatus(status);
      setActionWithTimeout(access.accessible ? '✅ Verificação concluída' : '❌ Erro na verificação');
      
      debugLog('DEBUG', access.accessible ? 'Firestore acessível:' : 'Firestore inacessível:', access);
    } catch (error) {
      const status = `❌ Erro: ${error.message}`;
      setFirestoreStatus(status);
      setActionWithTimeout('❌ Erro na verificação');
      errorLog('DEBUG', 'Erro ao verificar Firestore:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const showAlert = (title, message, isSuccess = false) => {
    Alert.alert(title, `${isSuccess ? '✅' : '❌'} ${message}`, [{ text: 'OK' }]);
  };

  const testLogout = async () => {
    debugLog('DEBUG', 'Iniciando teste de logout...');
    setIsTestingLogout(true);
    setLastAction('Testando logout...');

    try {
      debugLog('DEBUG', 'Chamando função de logout...');
      const result = await logout();
      debugLog('DEBUG', 'Resultado do logout:', result);
      
      const message = result.success 
        ? 'Logout funcionou perfeitamente!'
        : `Erro no logout: ${result.error}`;
      
      setActionWithTimeout(result.success ? '✅ Logout funcionou!' : `❌ Erro no logout: ${result.error}`);
      
      if (result.success) {
        successLog('DEBUG', '✅ Logout bem-sucedido');
      } else {
        errorLog('DEBUG', '❌ Erro no logout:', result.error);
      }
      
      showAlert('Teste de Logout', message, result.success);
    } catch (error) {
      const errorMsg = `Exceção: ${error.message}`;
      setActionWithTimeout(`❌ ${errorMsg}`);
      errorLog('DEBUG', 'Exceção no logout:', error);
      
      showAlert('Teste de Logout', `Erro inesperado: ${error.message}`, false);
    } finally {
      setIsTestingLogout(false);
    }
  };

  if (!__DEV__) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        🔍 Debug Rápido
      </Text>
      
      <StatusText theme={theme}>
        Auth: {isAuthenticated ? '✅ Logado' : '❌ Não logado'}
      </StatusText>
      
      <StatusText theme={theme}>
        Email: {user?.email || 'N/A'}
      </StatusText>
      
      <StatusText theme={theme}>
        {firestoreStatus}
      </StatusText>
      
      {lastAction && (
        <Text style={[styles.lastAction, { color: theme.colors.primary }]}>
          {lastAction}
        </Text>
      )}
      
      <View style={styles.buttonRow}>
        <ActionButton
          theme={theme}
          onPress={checkFirestoreStatus}
          disabled={isChecking}
          isLoading={isChecking}
        >
          Verificar
        </ActionButton>
        
        <ActionButton
          theme={theme}
          onPress={testLogout}
          disabled={isTestingLogout}
          isLoading={isTestingLogout}
          color={theme.colors.error}
        >
          Testar Logout
        </ActionButton>
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