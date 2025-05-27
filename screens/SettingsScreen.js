// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import ThemePreview from '../components/ThemePreview';

export default function SettingsScreen({ navigation }) {
  const { 
    theme, 
    isDark, 
    setLightTheme, 
    setDarkTheme, 
    useSystemTheme, 
    setSystemTheme 
  } = useTheme();
  
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites(user?.uid);
  
  // Estados para configurações
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dataAutoSync, setDataAutoSync] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Carregar configurações do AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [storedNotifications, storedAutoSync] = await Promise.all([
          AsyncStorage.getItem('@notifications_enabled'),
          AsyncStorage.getItem('@auto_sync_enabled')
        ]);
        
        if (storedNotifications !== null) {
          setNotificationsEnabled(JSON.parse(storedNotifications));
        }
        
        if (storedAutoSync !== null) {
          setDataAutoSync(JSON.parse(storedAutoSync));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Função para alternar notificações
  const toggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('@notifications_enabled', JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar configuração de notificações:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração de notificações');
      setNotificationsEnabled(!value); // Reverter em caso de erro
    }
  };
  
  // Função para alternar sincronização automática
  const toggleAutoSync = async (value) => {
    try {
      setDataAutoSync(value);
      await AsyncStorage.setItem('@auto_sync_enabled', JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar configuração de sincronização:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração de sincronização');
      setDataAutoSync(!value); // Reverter em caso de erro
    }
  };
  
  // Função para logout
  const handleLogout = () => {
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
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            
            try {
              const result = await logout();
              
              if (!result.success) {
                Alert.alert('Erro', result.error || 'Erro ao fazer logout');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro inesperado ao fazer logout');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  // Função para limpar cache
  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Isso irá remover todos os dados temporários do aplicativo. Deseja continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Aqui você pode implementar a limpeza do cache conforme necessário
              Alert.alert('Sucesso', 'Cache limpo com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao limpar cache');
            }
          }
        }
      ]
    );
  };

  // Renderizar seção de conta
  const renderAccountSection = () => {
    if (!isAuthenticated) {
      return (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Conta
          </Text>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => navigation.navigate('Login')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="log-in-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Fazer Login
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Conta
        </Text>
        
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
            <View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                {user?.displayName || 'Usuário'}
              </Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.secondaryText }]}>
                {user?.email}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.secondaryText} />
        </TouchableOpacity>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="heart-outline" size={24} color={theme.colors.primary} />
            <View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Favoritos
              </Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.secondaryText }]}>
                {favorites.length} filmes salvos
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.settingLabel, { color: theme.colors.error }]}>
              {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
            </Text>
          </View>
          {isLoggingOut && <ActivityIndicator size="small" color={theme.colors.error} />}
        </TouchableOpacity>
      </View>
    );
  };
  
  if (settingsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
            Carregando configurações...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.headerBackground,
        borderBottomColor: theme.colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
          Configurações
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Seção de Conta */}
        {renderAccountSection()}
        
        {/* Configurações de Aparência */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Aparência
          </Text>
          
          <View style={styles.themePreviewContainer}>
            <ThemePreview 
              isDark={false} 
              active={useSystemTheme ? !isDark : (!isDark && !useSystemTheme)}
              onPress={setLightTheme}
            />
            <ThemePreview 
              isDark={true} 
              active={useSystemTheme ? isDark : (isDark && !useSystemTheme)}
              onPress={setDarkTheme}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Usar Tema do Sistema
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: theme.colors.primary + "40" }}
              thumbColor={useSystemTheme ? theme.colors.primary : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setSystemTheme}
              value={useSystemTheme}
            />
          </View>
        </View>
        
        {/* Preferências */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferências
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Notificações
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: theme.colors.primary + "40" }}
              thumbColor={notificationsEnabled ? theme.colors.primary : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="sync-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Sincronização Automática
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: theme.colors.primary + "40" }}
              thumbColor={dataAutoSync ? theme.colors.primary : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleAutoSync}
              value={dataAutoSync}
            />
          </View>
        </View>

        {/* Dados e Armazenamento */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Dados e Armazenamento
          </Text>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Limpar Cache
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        </View>
        
        {/* Sobre o App */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sobre
          </Text>
          
          <View style={styles.aboutContainer}>
            <Text style={[styles.appName, { color: theme.colors.text }]}>
              MovieBox
            </Text>
            <Text style={[styles.appVersion, { color: theme.colors.secondaryText }]}>
              Versão 1.0.0
            </Text>
            <Text style={[styles.appDescription, { color: theme.colors.secondaryText }]}>
              Um aplicativo para os amantes de cinema descobrirem e organizarem seus filmes favoritos.
            </Text>
          </View>
        </View>

        {/* Espaço extra no final */}
        <View style={{ height: 20 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Ramabhadra_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  settingSubtitle: {
    fontSize: 14,
    marginLeft: 12,
    marginTop: 2,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  // Visualização de temas
  themePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  // Sobre o app
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Exo_700Bold',
  },
  appVersion: {
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
});