// src/screens/ProfileScreen.js
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
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";

export default function ProfileScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { user, updateProfile, updateProfilePicture, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites(user?.uid);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome válido");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateProfile({ name: editName.trim() });

      if (result.success) {
        setIsEditing(false);
        Alert.alert("Sucesso", "Perfil atualizado com sucesso");
      } else {
        Alert.alert("Erro", result.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user?.displayName || "");
    setIsEditing(false);
  };

const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos');
        return;
      }
      
      setIsUploadingImage(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.uri;
        
        // Validações de segurança
        const fileInfo = {
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType
        };
        
        // Fazer upload da imagem usando o serviço atualizado
        const updateResult = await updateProfilePicture(imageUri, fileInfo);
        
        if (updateResult.success) {
          Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
        } else {
          Alert.alert('Erro', updateResult.error || 'Erro ao atualizar foto');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar imagem: ' + error.message);
      console.error('Erro no pickImage:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para usar a câmera');
        return;
      }
      
      setIsUploadingImage(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.uri;
        
        const fileInfo = {
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType
        };
        
        const updateResult = await updateProfilePicture(imageUri, fileInfo);
        
        if (updateResult.success) {
          Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
        } else {
          Alert.alert('Erro', updateResult.error || 'Erro ao atualizar foto');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao tirar foto: ' + error.message);
      console.error('Erro no takePhoto:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Alterar Foto de Perfil',
      'Escolha uma opção:',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Escolher da Galeria',
          onPress: pickImage
        },
        {
          text: 'Tirar Foto',
          onPress: takePhoto
        }
      ]
    );
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

      {/* Header */}
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
        {/* Profile Info Card */}
        <View
          style={[styles.profileCard, { backgroundColor: theme.colors.card }]}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} disabled={isUploadingImage}>
              {isUploadingImage ? (
                <View style={styles.avatarContainer}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              ) : user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
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

              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* User Info Section */}
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

        {/* Stats Cards */}
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

        {/* Quick Actions */}
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
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    fontFamily: "Nunito_400Regular",
  },
  statLabel: {
    fontSize: 14,
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
