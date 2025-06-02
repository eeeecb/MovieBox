// services/base64ImageService.js
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { debugLog, errorLog, successLog } from '../config/debugConfig';

export const base64ImageService = {
  // Configurações para otimização
  MAX_DIMENSION: 200, // Máximo 200x200px para manter tamanho pequeno
  JPEG_QUALITY: 0.7,  // 70% de qualidade para balance tamanho/qualidade
  MAX_BASE64_SIZE: 100 * 1024, // 100KB em base64 (recomendado para Firestore)

  /**
   * Processa uma imagem para base64 otimizado
   * @param {string} imageUri - URI da imagem original
   * @param {Object} options - Opções de processamento
   * @returns {Promise<Object>} Resultado com base64 ou erro
   */
  async processImageToBase64(imageUri, options = {}) {
    try {
      debugLog('BASE64', 'Iniciando processamento de imagem para base64:', {
        uri: imageUri?.substring(0, 50) + '...',
        maxDimension: this.MAX_DIMENSION
      });

      // Redimensionar e otimizar a imagem
      const processedImage = await manipulateAsync(
        imageUri,
        [
          // Redimensionar mantendo aspect ratio
          { 
            resize: { 
              width: this.MAX_DIMENSION,
              height: this.MAX_DIMENSION
            } 
          }
        ],
        {
          compress: this.JPEG_QUALITY,
          format: SaveFormat.JPEG, // JPEG é mais compacto que PNG
          base64: true // Retornar base64
        }
      );

      if (!processedImage.base64) {
        throw new Error('Falha ao gerar base64 da imagem');
      }

      // Validar tamanho do base64
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

      // Criar data URI completo
      const dataUri = `data:image/jpeg;base64,${processedImage.base64}`;
      
      successLog('BASE64', `Imagem convertida com sucesso! Tamanho: ${sizeKB}KB`);
      
      return {
        success: true,
        base64: processedImage.base64,
        dataUri: dataUri,
        width: processedImage.width,
        height: processedImage.height,
        sizeKB: sizeKB,
        uri: processedImage.uri // URI temporária da imagem processada
      };

    } catch (error) {
      errorLog('BASE64', 'Erro ao processar imagem:', error);
      
      // Tratamento de erros específicos
      if (error.message?.includes('manipulate')) {
        return {
          success: false,
          error: 'Erro ao redimensionar imagem. Tente outra imagem.'
        };
      } else if (error.message?.includes('memory')) {
        return {
          success: false,
          error: 'Imagem muito grande para processar. Escolha uma imagem menor.'
        };
      }
      
      return {
        success: false,
        error: `Erro ao processar imagem: ${error.message}`
      };
    }
  },

  /**
   * Validar se uma imagem é adequada para conversão
   * @param {Object} asset - Asset do ImagePicker
   * @returns {Object} Resultado da validação
   */
  validateImageForBase64(asset) {
    try {
      debugLog('BASE64', 'Validando imagem para base64:', {
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        mimeType: asset.mimeType
      });

      // Verificar tipo MIME
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (asset.mimeType && !allowedTypes.includes(asset.mimeType)) {
        return {
          isValid: false,
          error: 'Formato não suportado. Use JPEG, PNG ou WebP.'
        };
      }

      // Verificar tamanho original (antes do processamento)
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) { // 10MB
        return {
          isValid: false,
          error: 'Arquivo muito grande. Escolha uma imagem menor que 10MB.'
        };
      }

      // Aviso para imagens muito grandes (podem gerar base64 grande)
      if (asset.width > 1000 || asset.height > 1000) {
        debugLog('BASE64', 'Imagem grande detectada - será redimensionada automaticamente');
      }

      return { isValid: true };
    } catch (error) {
      errorLog('BASE64', 'Erro na validação:', error);
      return {
        isValid: false,
        error: 'Erro ao validar imagem'
      };
    }
  },

  /**
   * Converter data URI de volta para informações úteis
   * @param {string} dataUri - Data URI da imagem
   * @returns {Object} Informações extraídas
   */
  parseDataUri(dataUri) {
    try {
      if (!dataUri || !dataUri.startsWith('data:image/')) {
        return null;
      }

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

  /**
   * Otimizar imagem existente em base64 (se necessário)
   * @param {string} dataUri - Data URI existente
   * @returns {Promise<Object>} Data URI otimizado
   */
  async optimizeExistingBase64(dataUri) {
    try {
      const parsed = this.parseDataUri(dataUri);
      
      if (!parsed) {
        throw new Error('Data URI inválido');
      }

      if (parsed.isValid) {
        debugLog('BASE64', 'Imagem já está otimizada');
        return {
          success: true,
          dataUri: dataUri,
          sizeKB: parsed.sizeKB
        };
      }

      // Se está muito grande, reprocessar
      debugLog('BASE64', 'Reotimizando imagem base64...');
      
      // Criar URI temporária e reprocessar
      const tempUri = dataUri;
      return await this.processImageToBase64(tempUri);
      
    } catch (error) {
      errorLog('BASE64', 'Erro ao otimizar base64:', error);
      return {
        success: false,
        error: `Erro ao otimizar: ${error.message}`
      };
    }
  },

  /**
   * Função utilitária para debug - mostrar estatísticas
   * @param {string} dataUri - Data URI para analisar
   */
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