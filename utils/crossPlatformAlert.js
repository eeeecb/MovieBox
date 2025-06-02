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

export const showTripleOptionAlert = (title, message, option1Text, option1Action, option2Text, option2Action, cancelAction = null) => {
  if (Platform.OS === 'web') {
    const choice = window.prompt(
      `${title}\n\n${message}\n\nEscolha uma opção:\n1 - ${option1Text}\n2 - ${option2Text}\n\nDigite 1 ou 2:`
    );
    
    if (choice === '1') {
      option1Action();
    } else if (choice === '2') {
      option2Action();
    } else if (cancelAction) {
      cancelAction();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: cancelAction || (() => {}) },
      { text: option1Text, onPress: option1Action },
      { text: option2Text, onPress: option2Action }
    ]);
  }
};

export const showImageSourceAlert = (onComputerSelect, onCameraSelect, onGallerySelect) => {
  if (Platform.OS === 'web') {
    const choice = window.prompt(
      `Alterar Foto de Perfil\n\nEscolha a fonte da imagem:\n\n1 - Computador/Arquivos\n2 - Câmera do dispositivo\n3 - Galeria do dispositivo\n\nDigite 1, 2 ou 3:`
    );
    
    if (choice === '1') {
      onComputerSelect();
    } else if (choice === '2') {
      onCameraSelect();
    } else if (choice === '3') {
      onGallerySelect();
    }
  } else {
    Alert.alert('Alterar Foto de Perfil', 'Escolha a fonte da imagem:', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: onCameraSelect },
      { text: 'Galeria', onPress: onGallerySelect }
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