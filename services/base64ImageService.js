import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { debugLog, errorLog, successLog } from '../config/debugConfig';

export const base64ImageService = {
  MAX_DIMENSION: 200,
  JPEG_QUALITY: 0.7,
  MAX_BASE64_SIZE: 100 * 1024,

  async processImageToBase64(imageUri, options = {}) {
    try {
      debugLog('BASE64', 'Iniciando processamento de imagem para base64:', {
        uri: imageUri?.substring(0, 50) + '...',
        maxDimension: this.MAX_DIMENSION
      });

      const processedImage = await manipulateAsync(
        imageUri,
        [{ resize: { width: this.MAX_DIMENSION, height: this.MAX_DIMENSION } }],
        {
          compress: this.JPEG_QUALITY,
          format: SaveFormat.JPEG,
          base64: true
        }
      );

      if (!processedImage.base64) {
        throw new Error('Falha ao gerar base64 da imagem');
      }

      const base64Size = processedImage.base64.length;
      const sizeKB = Math.round(base64Size / 1024);
      
      debugLog('BASE64', 'Imagem processada:', {
        originalUri: imageUri?.substring(0, 30) + '...',
        newWidth: processedImage.width,
        newHeight: processedImage.height,
        base64SizeKB: sizeKB,
        base64Preview: processedImage.base64.substring(0, 50) + '...'
      });

      if (base64Size > this.MAX_BASE64_SIZE) {
        errorLog('BASE64', `Imagem ainda muito grande após otimização: ${sizeKB}KB`);
        return {
          success: false,
          error: `Imagem muito complexa. Tente uma imagem mais simples ou menor (atual: ${sizeKB}KB, máximo: ${Math.round(this.MAX_BASE64_SIZE / 1024)}KB)`
        };
      }

      const dataUri = `data:image/jpeg;base64,${processedImage.base64}`;
      
      successLog('BASE64', `Imagem convertida com sucesso! Tamanho: ${sizeKB}KB`);
      
      return {
        success: true,
        base64: processedImage.base64,
        dataUri: dataUri,
        width: processedImage.width,
        height: processedImage.height,
        sizeKB: sizeKB,
        uri: processedImage.uri
      };

    } catch (error) {
      errorLog('BASE64', 'Erro ao processar imagem:', error);
      
      if (error.message?.includes('manipulate')) {
        return { success: false, error: 'Erro ao redimensionar imagem. Tente outra imagem.' };
      } else if (error.message?.includes('memory')) {
        return { success: false, error: 'Imagem muito grande para processar. Escolha uma imagem menor.' };
      }
      
      return { success: false, error: `Erro ao processar imagem: ${error.message}` };
    }
  },

  validateImageForBase64(asset) {
    try {
      debugLog('BASE64', 'Validando imagem para base64:', {
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        mimeType: asset.mimeType
      });

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (asset.mimeType && !allowedTypes.includes(asset.mimeType)) {
        return { isValid: false, error: 'Formato não suportado. Use JPEG, PNG ou WebP.' };
      }

      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        return { isValid: false, error: 'Arquivo muito grande. Escolha uma imagem menor que 10MB.' };
      }

      if (asset.width > 1000 || asset.height > 1000) {
        debugLog('BASE64', 'Imagem grande detectada - será redimensionada automaticamente');
      }

      return { isValid: true };
    } catch (error) {
      errorLog('BASE64', 'Erro na validação:', error);
      return { isValid: false, error: 'Erro ao validar imagem' };
    }
  },

  parseDataUri(dataUri) {
    try {
      if (!dataUri || !dataUri.startsWith('data:image/')) return null;

      const [header, base64Data] = dataUri.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1];
      const sizeKB = Math.round(base64Data.length / 1024);

      return {
        mimeType,
        base64: base64Data,
        sizeKB,
        isValid: sizeKB < (this.MAX_BASE64_SIZE / 1024)
      };
    } catch (error) {
      errorLog('BASE64', 'Erro ao parsear data URI:', error);
      return null;
    }
  },

  async optimizeExistingBase64(dataUri) {
    try {
      const parsed = this.parseDataUri(dataUri);
      
      if (!parsed) {
        throw new Error('Data URI inválido');
      }

      if (parsed.isValid) {
        debugLog('BASE64', 'Imagem já está otimizada');
        return { success: true, dataUri: dataUri, sizeKB: parsed.sizeKB };
      }

      debugLog('BASE64', 'Reotimizando imagem base64...');
      return await this.processImageToBase64(dataUri);
      
    } catch (error) {
      errorLog('BASE64', 'Erro ao otimizar base64:', error);
      return { success: false, error: `Erro ao otimizar: ${error.message}` };
    }
  },

  debugImageStats(dataUri) {
    const parsed = this.parseDataUri(dataUri);
    
    if (parsed) {
      debugLog('BASE64', 'Estatísticas da imagem:', {
        mimeType: parsed.mimeType,
        sizeKB: parsed.sizeKB,
        isValid: parsed.isValid,
        maxAllowed: Math.round(this.MAX_BASE64_SIZE / 1024) + 'KB'
      });
    } else {
      debugLog('BASE64', 'Data URI inválido ou não é imagem');
    }
  }
};