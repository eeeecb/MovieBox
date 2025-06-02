import { Alert, Platform } from 'react-native';

export const showConfirmAlert = (title, message, onConfirm, onCancel = null) => {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: onCancel || (() => {}) },
      { text: 'Confirmar', style: 'destructive', onPress: onConfirm }
    ]);
  }
};

export const showInfoAlert = (title, message, onPress = null) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress }]);
  }
};

export const showErrorAlert = (title, message, onPress = null) => {
  if (Platform.OS === 'web') {
    window.alert(`❌ ${title}\n\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress }]);
  }
};

export const showSuccessAlert = (title, message, onPress = null) => {
  if (Platform.OS === 'web') {
    window.alert(`✅ ${title}\n\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress }]);
  }
};

export const showLogoutConfirm = (onConfirm, onCancel = null) => {
  if (Platform.OS === 'web') {
    onConfirm();
  } else {
    Alert.alert('Confirmação', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel', onPress: onCancel || (() => {}) },
      { text: 'Sair', style: 'destructive', onPress: onConfirm }
    ]);
  }
};