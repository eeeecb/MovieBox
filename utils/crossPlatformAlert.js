// utils/crossPlatformAlert.js
import { Alert, Platform } from 'react-native';

/**
 * Alert cross-platform que funciona no mobile (iOS/Android) e web
 * No mobile usa Alert.alert(), na web usa window.confirm() ou executa diretamente
 */
export const showConfirmAlert = (title, message, onConfirm, onCancel = null) => {
  if (Platform.OS === 'web') {
    // Na web, usar confirm() nativo ou executar diretamente
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    // No mobile, usar Alert.alert() normal
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: onCancel || (() => {})
        },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: onConfirm
        }
      ]
    );
  }
};

/**
 * Alert simples para informações
 */
export const showInfoAlert = (title, message, onPress = null) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress }]);
  }
};

/**
 * Alert para erros
 */
export const showErrorAlert = (title, message, onPress = null) => {
  if (Platform.OS === 'web') {
    window.alert(`❌ ${title}\n\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress }]);
  }
};

/**
 * Alert para sucesso
 */
export const showSuccessAlert = (title, message, onPress = null) => {
  if (Platform.OS === 'web') {
    window.alert(`✅ ${title}\n\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress }]);
  }
};

/**
 * Para casos onde queremos logout direto na web (sem confirmação)
 */
export const showLogoutConfirm = (onConfirm, onCancel = null) => {
  if (Platform.OS === 'web') {
    // Na web, executar logout diretamente OU usar confirm
    // Opção 1: Logout direto (mais rápido para web)
    onConfirm();
    
    // Opção 2: Usar confirm (descomente se preferir confirmação na web)
    // const confirmed = window.confirm('Tem certeza que deseja sair da sua conta?');
    // if (confirmed) {
    //   onConfirm();
    // } else if (onCancel) {
    //   onCancel();
    // }
  } else {
    // No mobile, manter confirmação
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: onCancel || (() => {})
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: onConfirm
        }
      ]
    );
  }
};