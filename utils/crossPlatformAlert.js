// utils/crossPlatformAlert.js - VERSÃO MELHORADA
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
 * Alert com três opções customizadas para web e mobile
 */
export const showTripleOptionAlert = (title, message, option1Text, option1Action, option2Text, option2Action, cancelAction = null) => {
  if (Platform.OS === 'web') {
    // Na web, simular com prompts sequenciais
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
    // No mobile, usar Alert.alert() com três botões
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: cancelAction || (() => {})
        },
        {
          text: option1Text,
          onPress: option1Action
        },
        {
          text: option2Text,
          onPress: option2Action
        }
      ]
    );
  }
};

/**
 * Alert específico para seleção de fonte de imagem (web vs mobile)
 */
export const showImageSourceAlert = (onComputerSelect, onCameraSelect, onGallerySelect) => {
  if (Platform.OS === 'web') {
    // Na web, priorizar computador
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
    // No mobile, apenas câmera e galeria
    Alert.alert(
      'Alterar Foto de Perfil',
      'Escolha a fonte da imagem:',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Câmera',
          onPress: onCameraSelect
        },
        {
          text: 'Galeria',
          onPress: onGallerySelect
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