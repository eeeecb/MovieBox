import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Image, 
  TextInput, 
  Modal, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ThemePreview from '../components/ThemePreview';

export default function SettingsScreen({ navigation }) {
  const { theme, isDark, setLightTheme, setDarkTheme, useSystemTheme, setSystemTheme } = useTheme();
  const { user, isAuthenticated, logout, updateProfilePicture, updateUserData, login, register } = useAuth();
  
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegistrationModalVisible, setIsRegistrationModalVisible] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Campos para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Campos para registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Campos para edição de perfil
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Outras configurações
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dataAutoSync, setDataAutoSync] = useState(true);
  
  // Carregar configurações adicionais do AsyncStorage
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('@notifications_enabled');
        const storedAutoSync = await AsyncStorage.getItem('@auto_sync_enabled');
        
        if (storedNotifications !== null) {
          setNotificationsEnabled(JSON.parse(storedNotifications));
        }
        
        if (storedAutoSync !== null) {
          setDataAutoSync(JSON.parse(storedAutoSync));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Funções para manipular notificações
  const toggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('@notifications_enabled', JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar configuração de notificações:', error);
    }
  };
  
  // Funções para manipular sincronização automática
  const toggleAutoSync = async (value) => {
    try {
      setDataAutoSync(value);
      await AsyncStorage.setItem('@auto_sync_enabled', JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar configuração de sincronização:', error);
    }
  };
  
  // Funções para lidar com a autenticação
  const handleLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      // Verificar campos
      if (!loginEmail || !loginPassword) {
        throw new Error('Por favor, preencha todos os campos');
      }
      
      // Usar o contexto de autenticação
      const result = await login({
        email: loginEmail,
        password: loginPassword
      });
      
      if (result.success) {
        // Limpar campos e fechar modal
        setLoginEmail('');
        setLoginPassword('');
        setIsLoginModalVisible(false);
      } else {
        setLoginError(result.error || 'Erro no login');
      }
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleRegister = async () => {
    setRegisterError('');
    setIsRegistering(true);
    
    try {
      // Verificar campos
      if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
        throw new Error('Por favor, preencha todos os campos');
      }
      
      if (registerPassword !== registerConfirmPassword) {
        throw new Error('As senhas não correspondem');
      }
      
      // Usar o contexto de autenticação
      const result = await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword
      });
      
      if (result.success) {
        // Limpar campos e fechar modal
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
        setIsRegistrationModalVisible(false);
      } else {
        setRegisterError(result.error || 'Erro no registro');
      }
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Erro', result.error || 'Erro ao fazer logout');
            }
          }
        }
      ]
    );
  };
  
  // Funções para manipular imagens
  const pickImage = async () => {
    try {
      // Pedir permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos');
        return;
      }
      
      setIsUploadingImage(true);
      
      // Abrir o seletor de imagens
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Atualizar a imagem de perfil
        const imageUri = result.assets[0].uri;
        const updateResult = await updateProfilePicture(imageUri);
        
        if (!updateResult.success) {
          Alert.alert('Erro', updateResult.error || 'Erro ao atualizar foto de perfil');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao selecionar imagem: ' + error.message);
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  // Funções para edição de perfil
  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      
      // Verificar campos
      if (!editName || !editEmail) {
        throw new Error('Por favor, preencha todos os campos');
      }
      
      // Atualizar dados do usuário
      const result = await updateUserData({
        name: editName,
        email: editEmail
      });
      
      if (result.success) {
        setIsEditingProfile(false);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      } else {
        throw new Error(result.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  // Renderizar perfil do usuário
  const renderUserProfile = () => {
    if (isAuthenticated && user) {
      return (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Perfil</Text>
          
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={pickImage} disabled={isUploadingImage}>
              {isUploadingImage ? (
                <View style={styles.profileImagePlaceholder}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              ) : user.profilePicture ? (
                <Image 
                  source={{ uri: user.profilePicture }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImagePlaceholderText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View style={styles.editImageIcon}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            
            {isEditingProfile ? (
              <View style={styles.profileEditForm}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="Nome"
                  placeholderTextColor={theme.colors.secondaryText}
                  value={editName}
                  onChangeText={setEditName}
                />
                
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="Email"
                  placeholderTextColor={theme.colors.secondaryText}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <View style={styles.rowButtons}>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={() => {
                      setEditName(user.name);
                      setEditEmail(user.email);
                      setIsEditingProfile(false);
                    }}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.saveButton]} 
                    onPress={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Salvar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: theme.colors.text }]}>{user.name}</Text>
                <Text style={[styles.profileEmail, { color: theme.colors.secondaryText }]}>{user.email}</Text>
                
                <View style={styles.rowButtons}>
                  <TouchableOpacity 
                    style={[styles.button, styles.editButton]} 
                    onPress={() => setIsEditingProfile(true)}
                  >
                    <Text style={styles.buttonText}>Editar Perfil</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.logoutButton]} 
                    onPress={handleLogout}
                  >
                    <Text style={styles.buttonText}>Sair</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      );
    } else {
      return (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Conta</Text>
          
          <View style={styles.authButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.loginButton]} 
              onPress={() => setIsLoginModalVisible(true)}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.registerButton]} 
              onPress={() => setIsRegistrationModalVisible(true)}
            >
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Configurações</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Perfil do Usuário */}
        {renderUserProfile()}
        
        {/* Configurações de Aparência */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aparência</Text>
          
          <View style={styles.themePreviewContainer}>
            <ThemePreview 
              isDark={false} 
              active={!isDark} // Mostra ativo se o tema atual é claro, independente de ser sistema ou manual
              onPress={setLightTheme}
            />
            <ThemePreview 
              isDark={true} 
              active={isDark} // Mostra ativo se o tema atual é escuro, independente de ser sistema ou manual
              onPress={setDarkTheme}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Usar Tema do Sistema</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={useSystemTheme ? theme.colors.primary : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setSystemTheme}
              value={useSystemTheme}
            />
          </View>
        </View>
        
        {/* Outras Configurações */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferências</Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Notificações</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notificationsEnabled ? theme.colors.primary : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Sincronizar dados automaticamente</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={dataAutoSync ? theme.colors.primary : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleAutoSync}
              value={dataAutoSync}
            />
          </View>
        </View>
        
        {/* Sobre o App */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sobre</Text>
          <Text style={[styles.aboutText, { color: theme.colors.secondaryText }]}>
            FilmX versão 1.0.0
          </Text>
          <Text style={[styles.aboutText, { color: theme.colors.secondaryText }]}>
            Um aplicativo para os amantes de cinema acompanharem seus filmes favoritos.
          </Text>
        </View>
      </ScrollView>
      
      {/* Modal de Login */}
      <Modal
        visible={isLoginModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLoginModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Entrar</Text>
            
            {loginError ? (
              <Text style={styles.errorText}>{loginError}</Text>
            ) : null}
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text
                }
              ]}
              placeholder="Email"
              placeholderTextColor={theme.colors.secondaryText}
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text
                }
              ]}
              placeholder="Senha"
              placeholderTextColor={theme.colors.secondaryText}
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setIsLoginModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.loginButton]} 
                onPress={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.switchAuthMode}
              onPress={() => {
                setIsLoginModalVisible(false);
                setIsRegistrationModalVisible(true);
              }}
            >
              <Text style={[styles.switchAuthText, { color: theme.colors.primary }]}>
                Não tem uma conta? Registre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal de Registro */}
      <Modal
        visible={isRegistrationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsRegistrationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Registrar</Text>
            
            {registerError ? (
              <Text style={styles.errorText}>{registerError}</Text>
            ) : null}
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text
                }
              ]}
              placeholder="Nome"
              placeholderTextColor={theme.colors.secondaryText}
              value={registerName}
              onChangeText={setRegisterName}
            />
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text
                }
              ]}
              placeholder="Email"
              placeholderTextColor={theme.colors.secondaryText}
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text
                }
              ]}
              placeholder="Senha"
              placeholderTextColor={theme.colors.secondaryText}
              value={registerPassword}
              onChangeText={setRegisterPassword}
              secureTextEntry
            />
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text
                }
              ]}
              placeholder="Confirmar Senha"
              placeholderTextColor={theme.colors.secondaryText}
              value={registerConfirmPassword}
              onChangeText={setRegisterConfirmPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setIsRegistrationModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.registerButton]} 
                onPress={handleRegister}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Registrar</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.switchAuthMode}
              onPress={() => {
                setIsRegistrationModalVisible(false);
                setIsLoginModalVisible(true);
              }}
            >
              <Text style={[styles.switchAuthText, { color: theme.colors.primary }]}>
                Já tem uma conta? Faça login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Constants.statusBarHeight + 16,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 12,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Ramabhadra_400Regular',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  // Estilos para perfil de usuário
  profileContainer: {
    alignItems: 'center',
    padding: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  editImageIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E88E5',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Ramabhadra_400Regular',
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  profileEditForm: {
    width: '100%',
    marginTop: 12,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  loginButton: {
    backgroundColor: '#1976D2',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#1E88E5',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  // Estilos para autenticação
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  // Estilos para visualização de temas
  themePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  // Estilos para modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Ramabhadra_400Regular',
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  switchAuthMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  errorText: {
    color: '#F44336',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  // Sobre o app
  aboutText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
});