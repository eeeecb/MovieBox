// services/firebaseStorage.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebaseConfig';

export const firebaseStorageService = {
  // Formatos de imagem permitidos por segurança
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  // Validar arquivo de imagem
  validateImageFile(uri, fileInfo = {}) {
    try {
      // Verificar tamanho do arquivo (se disponível)
      if (fileInfo.fileSize && fileInfo.fileSize > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: 'A imagem deve ter no máximo 5MB'
        };
      }

      // Extrair extensão do arquivo
      const fileExtension = uri.split('.').pop()?.toLowerCase();
      
      if (!fileExtension) {
        return {
          isValid: false,
          error: 'Não foi possível determinar o formato da imagem'
        };
      }

      // Verificar se o formato é permitido
      if (!this.ALLOWED_IMAGE_FORMATS.includes(fileExtension)) {
        return {
          isValid: false,
          error: `Formato não permitido. Use: ${this.ALLOWED_IMAGE_FORMATS.join(', ')}`
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'Erro ao validar imagem'
      };
    }
  },

  // Upload de foto de perfil
  async uploadProfilePicture(userId, imageUri, fileInfo = {}) {
    try {
      // Validar imagem
      const validation = this.validateImageFile(imageUri, fileInfo);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Obter o blob da imagem
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Verificar o tipo MIME do blob
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp'
      ];

      if (!allowedMimeTypes.includes(blob.type)) {
        return { 
          success: false, 
          error: 'Tipo de arquivo não permitido. Use apenas JPG, PNG ou WebP.' 
        };
      }

      // Criar referência no Storage
      const fileName = `profile_pictures/${userId}_${Date.now()}.${blob.type.split('/')[1]}`;
      const storageRef = ref(storage, fileName);

      // Fazer upload
      const snapshot = await uploadBytes(storageRef, blob);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);

      return { 
        success: true, 
        downloadURL,
        fileName: snapshot.ref.name 
      };

    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      
      // Tratamento de erros específicos
      if (error.code === 'storage/unauthorized') {
        return { success: false, error: 'Não autorizado para fazer upload' };
      } else if (error.code === 'storage/canceled') {
        return { success: false, error: 'Upload cancelado' };
      } else if (error.code === 'storage/unknown') {
        return { success: false, error: 'Erro desconhecido no servidor' };
      }

      return { 
        success: false, 
        error: 'Erro ao fazer upload da imagem. Tente novamente.' 
      };
    }
  },

  // Deletar foto de perfil anterior
  async deleteProfilePicture(photoURL) {
    try {
      if (!photoURL || !photoURL.includes('firebase')) {
        return { success: true }; // Não há imagem para deletar
      }

      // Extrair o caminho do arquivo da URL
      const storageRef = ref(storage, photoURL);
      await deleteObject(storageRef);

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar imagem anterior:', error);
      // Não é crítico se não conseguir deletar a imagem anterior
      return { success: true };
    }
  },

  // Obter informações do arquivo de imagem (para validação adicional)
  async getImageInfo(uri) {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          });
        };
        img.onerror = () => {
          resolve(null);
        };
        img.src = uri;
      });
    } catch (error) {
      console.error('Erro ao obter informações da imagem:', error);
      return null;
    }
  }
};