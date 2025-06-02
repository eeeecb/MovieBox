import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '../utils/crossPlatformAlert';
import { base64ImageService } from '../services/base64ImageService';
import { debugLog, errorLog, successLog } from '../config/debugConfig';

export default function ProfileScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { user, updateProfile, updateProfilePicture, removeProfilePicture, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites(user?.uid);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showErrorAlert("Erro", "Por favor, insira um nome válido");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateProfile({ name: editName.trim() });

      if (result.success) {
        setIsEditing(false);
        showSuccessAlert("Sucesso", "Perfil atualizado com sucesso");
      } else {
        showErrorAlert("Erro", result.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      showErrorAlert("Erro", error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user?.displayName || "");
    setIsEditing(false);
  };

  const processAndUploadImage = async (imageUri, asset) => {
    try {
      debugLog('PROFILE', 'Iniciando processamento de imagem');
      
      const validation = base64ImageService.validateImageForBase64(asset);
      if (!validation.isValid) {
        showErrorAlert('Imagem Inválida', validation.error);
        return false;
      }

      const base64Result = await base64ImageService.processImageToBase64(imageUri);
      
      if (!base64Result.success) {
        showErrorAlert('Erro no Processamento', base64Result.error);
        return false;
      }

      const fileInfo = {
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType
      };

      const uploadResult = await updateProfilePicture(imageUri, fileInfo);
      
      if (uploadResult.success) {
        successLog('PROFILE', 'Upload concluído com sucesso');
        showSuccessAlert('Sucesso!', 'Foto de perfil atualizada com sucesso', () => {
          if (Platform.OS === 'web') {
            setTimeout(() => window.location.reload(), 1000);
          }
        });
        return true;
      } else {
        showErrorAlert('Erro no Upload', uploadResult.error);
        return false;
      }

    } catch (error) {
      errorLog('PROFILE', 'Erro no processamento:', error);
      showErrorAlert('Erro', `Erro ao processar imagem: ${error.message}`);
      return false;
    }
  };

  const pickImageFromComputer = async () => {
    try {
      debugLog('PROFILE', 'Iniciando seleção via computador/web...');
      
      if (Platform.OS !== 'web') {
        showErrorAlert('Erro', 'Esta opção está disponível apenas na versão web');
        return;
      }

      setIsUploadingImage(true);

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
      
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
          debugLog('PROFILE', 'Nenhum arquivo selecionado');
          setIsUploadingImage(false);
          return;
        }

        debugLog('PROFILE', 'Arquivo selecionado via computador:', {
          name: file.name,
          size: Math.round(file.size / 1024) + 'KB',
          type: file.type
        });

        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const imageUri = e.target.result;
            
            const asset = {
              uri: imageUri,
              width: 0,
              height: 0,
              fileSize: file.size,
              mimeType: file.type,
              fileName: file.name
            };

            await processAndUploadImage(imageUri, asset);
          };
          
          reader.onerror = () => {
            showErrorAlert('Erro', 'Erro ao ler arquivo selecionado');
            setIsUploadingImage(false);
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          errorLog('PROFILE', 'Erro ao processar arquivo:', error);
          showErrorAlert('Erro', `Erro ao processar arquivo: ${error.message}`);
          setIsUploadingImage(false);
        }
      };

      input.oncancel = () => {
        debugLog('PROFILE', 'Seleção cancelada');
        setIsUploadingImage(false);
      };

      input.click();
      
    } catch (error) {
      errorLog('PROFILE', 'Erro no pickImageFromComputer:', error);
      showErrorAlert('Erro', `Erro ao abrir seletor: ${error.message}`);
      setIsUploadingImage(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      debugLog('PROFILE', 'Solicitando permissão para galeria...');
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showErrorAlert('Permissão Negada', 'Precisamos de permissão para acessar suas fotos');
        return;
      }
      
      setIsUploadingImage(true);
      debugLog('PROFILE', 'Abrindo galeria...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        allowsMultipleSelection: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        debugLog('PROFILE', 'Imagem selecionada da galeria');
        
        await processAndUploadImage(asset.uri, asset);
      } else {
        debugLog('PROFILE', 'Seleção de imagem cancelada');
      }
      
    } catch (error) {
      errorLog('PROFILE', 'Erro no pickImageFromGallery:', error);
      showErrorAlert('Erro', `Erro ao selecionar imagem: ${error.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      debugLog('PROFILE', 'Solicitando permissão para câmera...');
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        showErrorAlert('Permissão Negada', 'Precisamos de permissão para usar a câmera');
        return;
      }
      
      setIsUploadingImage(true);
      debugLog('PROFILE', 'Abrindo câmera...');
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        debugLog('PROFILE', 'Foto capturada pela câmera');
        
        await processAndUploadImage(asset.uri, asset);
      }
      
    } catch (error) {
      errorLog('PROFILE', 'Erro no takePhotoWithCamera:', error);
      showErrorAlert('Erro', `Erro ao tirar foto: ${error.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    showConfirmAlert(
      'Remover Foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      async () => {
        setIsUploadingImage(true);
        
        try {
          const result = await removeProfilePicture();
          
          if (result.success) {
            showSuccessAlert('Sucesso', 'Foto de perfil removida com sucesso', () => {
              if (Platform.OS === 'web') {
                setTimeout(() => window.location.reload(), 1000);
              }
            });
          } else {
            showErrorAlert('Erro', result.error || 'Erro ao remover foto');
          }
        } catch (error) {
          showErrorAlert('Erro', 'Erro inesperado ao remover foto');
        } finally {
          setIsUploadingImage(false);
        }
      }
    );
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      pickImageFromComputer();
    } else {
      showConfirmAlert(
        'Alterar Foto',
        'Escolha como deseja adicionar uma foto:',
        takePhotoWithCamera,
        pickImageFromGallery
      );
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.secondaryText }]}
          >
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.headerBackground,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
          Perfil
        </Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          disabled={isEditing && isUpdating}
        >
          <Ionicons
            name={isEditing ? "close-outline" : "create-outline"}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View
          style={[styles.profileCard, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={showImageOptions} disabled={isUploadingImage}>
              {isUploadingImage ? (
                <View style={styles.avatarContainer}>
                  <ActivityIndicator color={theme.colors.primary} size="large" />
                  <Text style={[styles.uploadingText, { color: theme.colors.primary }]}>
                    Processando...
                  </Text>
                </View>
              ) : user?.photoURL ? (
                <Image 
                  key={`avatar-${user.uid}-${Date.now()}`}
                  source={{ uri: user.photoURL }} 
                  style={styles.avatar} 
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {user?.displayName?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </Text>
                </View>
              )}

              {!isUploadingImage && (
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {user?.photoURL && !isUploadingImage && (
              <TouchableOpacity 
                style={styles.removePhotoButton} 
                onPress={handleRemovePhoto}
              >
                <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                <Text style={[styles.removePhotoText, { color: theme.colors.error }]}>
                  Remover foto
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.userInfoSection}>
            {isEditing ? (
              <View style={styles.editForm}>
                <TextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Nome"
                  placeholderTextColor={theme.colors.secondaryText}
                  value={editName}
                  onChangeText={setEditName}
                />

                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={handleSaveProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Salvar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>
                  {user?.displayName || "Nome não informado"}
                </Text>
                <Text
                  style={[
                    styles.userEmail,
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  {user?.email}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View
            style={[styles.statCard, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="heart" size={24} color="#F44336" />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {favoritesLoading ? "..." : favorites.length}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.secondaryText }]}
            >
              Favoritos
            </Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).getFullYear()
                : new Date().getFullYear()}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.secondaryText }]}
            >
              Membro desde
            </Text>
          </View>
        </View>

        <View
          style={[styles.actionsCard, { backgroundColor: theme.colors.card }]}
        >
          <Text style={[styles.actionsTitle, { color: theme.colors.text }]}>
            Ações Rápidas
          </Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate("Main", { screen: "Favorites" })}
          >
            <Ionicons
              name="heart-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Ver Favoritos
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Configurações
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.secondaryText}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Nunito_400Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "EncodeSansExpanded_400Regular",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1E88E5",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  removePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 6,
  },
  removePhotoText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: "EncodeSansExpanded_400Regular",
  },
  userInfoSection: {
    alignItems: "center",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "Nunito_400Regular",
  },
  userEmail: {
    fontSize: 16,
    fontFamily: "EncodeSansExpanded_400Regular",
  },
  editForm: {
    width: "100%",
    alignItems: "center",
  },
  editInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "EncodeSansExpanded_400Regular",
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#757575",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "EncodeSansExpanded_500Medium",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    fontFamily: "Nunito_400Regular",
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "EncodeSansExpanded_400Regular",
  },
  actionsCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Nunito_400Regular",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontFamily: "EncodeSansExpanded_400Regular",
  },
});