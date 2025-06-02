import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { base64ImageService } from '../services/base64ImageService';
import { debugLog, errorLog, successLog } from '../config/debugConfig';

const DebugButton = ({ theme, onPress, disabled, style, children }) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      style,
      { opacity: disabled ? 0.5 : 1 }
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{children}</Text>
  </TouchableOpacity>
);

const ImagePreview = ({ image, label, theme }) => {
  if (!image) return null;
  
  return (
    <View style={styles.imagePreview}>
      <Text style={[styles.previewLabel, { color: theme.colors.text }]}>
        {label}
      </Text>
      <Image source={{ uri: image.uri || image.dataUri }} style={styles.previewImage} />
      <Text style={[styles.previewSize, { color: theme.colors.secondaryText }]}>
        {image.width}x{image.height}
      </Text>
    </View>
  );
};

const LogDisplay = ({ testResult, theme }) => {
  if (!testResult) return null;
  
  return (
    <ScrollView style={styles.resultContainer} nestedScrollEnabled={true}>
      <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
        📋 Log de Debug:
      </Text>
      <Text style={[styles.resultText, { color: theme.colors.secondaryText }]}>
        {testResult}
      </Text>
    </ScrollView>
  );
};

export default function Base64ImageDebug() {
  const { theme } = useTheme();
  const { user, updateProfilePicture } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Result, setBase64Result] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!__DEV__) return null;

  const logTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newResult = `[${timestamp}] ${type.toUpperCase()}: ${message}\n`;
    setTestResult(prev => prev + newResult);
    
    const logFunctions = {
      error: errorLog,
      success: successLog,
      info: debugLog
    };
    
    (logFunctions[type] || debugLog)('BASE64_DEBUG', message);
  };

  const clearResults = () => {
    setTestResult('');
    setSelectedImage(null);
    setBase64Result(null);
  };

  const analyzeUserPhoto = () => {
    logTestResult('👤 Verificando autenticação...');
    
    if (!user) {
      logTestResult('❌ Usuário não logado', 'error');
      return;
    }

    logTestResult(`✅ Usuário logado: ${user.email}`, 'success');
    logTestResult(`🆔 UID: ${user.uid}`);
    logTestResult(`📸 Foto atual: ${user.photoURL ? 'Sim' : 'Não'}`);
    
    if (user.photoURL) {
      const isBase64 = user.photoURL.startsWith('data:image/');
      logTestResult(`📋 Tipo de foto: ${isBase64 ? 'Base64' : 'URL'}`);
      
      if (isBase64) {
        const parsed = base64ImageService.parseDataUri(user.photoURL);
        if (parsed) {
          logTestResult(`📏 Tamanho atual: ${parsed.sizeKB}KB`);
          logTestResult(`🎨 Formato: ${parsed.mimeType}`);
          logTestResult(`✅ Válida: ${parsed.isValid ? 'Sim' : 'Não'}`);
          
          if (!parsed.isValid) {
            logTestResult('⚠️ Foto atual muito grande para padrão', 'error');
          }
        } else {
          logTestResult('❌ Erro ao analisar base64', 'error');
        }
      } else {
        logTestResult('ℹ️ Foto atual é URL (não base64)');
        logTestResult(`🔗 URL: ${user.photoURL.substring(0, 50)}...`);
      }
    }
  };

  const requestImagePermission = async () => {
    logTestResult('📱 Solicitando permissão para galeria...');
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      logTestResult('❌ Permissão negada', 'error');
      return false;
    }
    
    logTestResult('✅ Permissão concedida, abrindo galeria...');
    return true;
  };

  const analyzeSelectedImage = (asset) => {
    logTestResult('📋 Analisando imagem selecionada...');
    logTestResult(`📁 URI: ${asset.uri?.substring(0, 60)}...`);
    logTestResult(`🎨 Tipo: ${asset.mimeType || 'não informado'}`);
    logTestResult(`📏 Tamanho arquivo: ${asset.fileSize ? (asset.fileSize / 1024).toFixed(2) + ' KB' : 'não informado'}`);
    logTestResult(`📐 Dimensões: ${asset.width}x${asset.height}`);
    logTestResult(`📝 Nome: ${asset.fileName || 'não informado'}`);
    
    logTestResult('🔍 Validando imagem para base64...');
    const validation = base64ImageService.validateImageForBase64(asset);
    
    if (validation.isValid) {
      logTestResult('✅ Imagem válida para conversão!', 'success');
    } else {
      logTestResult(`❌ Imagem inválida: ${validation.error}`, 'error');
    }
    
    return validation.isValid;
  };

  const selectImage = async () => {
    try {
      const hasPermission = await requestImagePermission();
      if (!hasPermission) return;
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1.0,
        allowsMultipleSelection: false,
      });
      
      if (result.canceled) {
        logTestResult('⏹️ Seleção cancelada');
        return;
      }
      
      if (!result.assets || result.assets.length === 0) {
        logTestResult('❌ Nenhum asset retornado', 'error');
        return;
      }
      
      const asset = result.assets[0];
      const isValid = analyzeSelectedImage(asset);
      
      if (isValid) {
        setSelectedImage(asset);
      }
      
    } catch (error) {
      logTestResult(`💥 Erro geral: ${error.message}`, 'error');
    }
  };

  const processToBase64 = async () => {
    if (!selectedImage) {
      logTestResult('❌ Nenhuma imagem selecionada', 'error');
      return;
    }
    
    setProcessing(true);
    logTestResult('🔄 Iniciando conversão para base64...');
    
    try {
      const result = await base64ImageService.processImageToBase64(selectedImage.uri);
      
      if (result.success) {
        logTestResult('🎉 Conversão bem-sucedida!', 'success');
        logTestResult(`📏 Tamanho final: ${result.sizeKB}KB`);
        logTestResult(`📐 Dimensões finais: ${result.width}x${result.height}`);
        logTestResult(`🎨 Formato: JPEG`);
        logTestResult(`💾 Base64 preview: ${result.base64.substring(0, 50)}...`);
        
        setBase64Result(result);
        base64ImageService.debugImageStats(result.dataUri);
      } else {
        logTestResult(`❌ Falha na conversão: ${result.error}`, 'error');
      }
      
    } catch (error) {
      logTestResult(`💥 Exceção na conversão: ${error.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const uploadToFirestore = async () => {
    if (!base64Result || !user?.uid) {
      logTestResult('❌ Nenhuma imagem processada ou usuário não logado', 'error');
      return;
    }
    
    setUploading(true);
    logTestResult('🚀 Iniciando upload para Firestore...');
    
    try {
      const fileInfo = {
        fileSize: selectedImage.fileSize,
        width: selectedImage.width,
        height: selectedImage.height,
        mimeType: selectedImage.mimeType
      };
      
      const result = await updateProfilePicture(selectedImage.uri, fileInfo);
      
      if (result.success) {
        logTestResult('🎉 Upload concluído com sucesso!', 'success');
        logTestResult(`📎 Foto salva (${result.sizeKB}KB)`);
        logTestResult(`✅ Imagem sincronizada no Firestore`);
        logTestResult(`🔄 Deve aparecer em outros dispositivos`);
      } else {
        logTestResult(`❌ Falha no upload: ${result.error}`, 'error');
      }
      
    } catch (error) {
      logTestResult(`💥 Exceção no upload: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const buttonConfigs = [
    { onPress: analyzeUserPhoto, color: theme.colors.primary, text: 'Verificar Auth' },
    { onPress: () => user?.photoURL ? analyzeUserPhoto() : logTestResult('❌ Usuário não tem foto de perfil', 'error'), color: '#9C27B0', text: 'Analisar Foto' },
    { onPress: selectImage, color: '#2196F3', text: 'Selecionar' },
    { onPress: processToBase64, color: '#FF9800', text: processing ? 'Processando...' : 'Para Base64', disabled: !selectedImage || processing },
    { onPress: uploadToFirestore, color: '#4CAF50', text: uploading ? 'Enviando...' : 'Upload Final', disabled: !base64Result || uploading },
    { onPress: clearResults, color: '#757575', text: 'Limpar' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: '#4CAF50' }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        🖼️ Debug Base64 (Grátis)
      </Text>
      
      <View style={styles.buttonGrid}>
        {buttonConfigs.map((config, index) => (
          <DebugButton
            key={index}
            theme={theme}
            onPress={config.onPress}
            disabled={config.disabled}
            style={{ backgroundColor: config.color }}
          >
            {config.text}
          </DebugButton>
        ))}
      </View>
      
      <View style={styles.previewContainer}>
        <ImagePreview 
          image={selectedImage} 
          label="Original:" 
          theme={theme} 
        />
        <ImagePreview 
          image={base64Result} 
          label={`Base64 (${base64Result?.sizeKB || 0}KB):`} 
          theme={theme} 
        />
      </View>
      
      <LogDisplay testResult={testResult} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 10,
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 11,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  previewSize: {
    fontSize: 9,
    marginTop: 2,
  },
  resultContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 5,
    maxHeight: 150,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 9,
    fontFamily: 'monospace',
    lineHeight: 12,
  },
});