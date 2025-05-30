// src/components/CustomDrawerContent.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { debugLog, errorLog, successLog } from '../config/debugConfig';
import { showLogoutConfirm, showErrorAlert } from '../utils/crossPlatformAlert';

export default function CustomDrawerContent(props) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Estado para controlar o loading do logout
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    debugLog('DRAWER', 'Botão de logout pressionado');
    debugLog('DRAWER', 'Usuário atual:', {
      email: user?.email,
      displayName: user?.displayName,
      uid: user?.uid
    });
    
    // Usar função cross-platform para o alert de confirmação
    showLogoutConfirm(
      // Função onConfirm (quando usuário confirma o logout)
      async () => {
        debugLog('DRAWER', '==========================================');
        debugLog('DRAWER', '🚀 INICIANDO PROCESSO DE LOGOUT');
        debugLog('DRAWER', '==========================================');
        debugLog('DRAWER', 'Timestamp:', new Date().toISOString());
        debugLog('DRAWER', 'Estado antes do logout:', {
          isLoggingOut: isLoggingOut,
          hasUser: !!user,
          userEmail: user?.email
        });
        
        setIsLoggingOut(true);
        debugLog('DRAWER', 'Estado de loading ativado');

        try {
          debugLog('DRAWER', '📞 Chamando função de logout do hook...');
          debugLog('DRAWER', 'Hook de logout disponível:', typeof logout === 'function');
          
          const startTime = Date.now();
          const result = await logout();
          const endTime = Date.now();
          
          debugLog('DRAWER', `⏱️ Tempo de execução do logout: ${endTime - startTime}ms`);
          debugLog('DRAWER', '📋 Resultado completo do logout:', {
            success: result?.success,
            error: result?.error,
            timestamp: new Date().toISOString()
          });
          
          if (result?.success) {
            successLog('DRAWER', 'LOGOUT BEM-SUCEDIDO!');
            debugLog('DRAWER', '🎯 Usuário deve ser redirecionado automaticamente');
            debugLog('DRAWER', '🧹 Limpeza de estado local realizada');
            
            // Não mostrar alert de sucesso, pois o usuário será redirecionado
          } else {
            errorLog('DRAWER', 'FALHA NO LOGOUT');
            debugLog('DRAWER', '🚨 Erro reportado:', result?.error);
            debugLog('DRAWER', '📱 Exibindo alert de erro para o usuário');
            
            showErrorAlert(
              'Erro no Logout',
              result?.error || 'Erro ao fazer logout. Tente novamente.',
              () => {
                debugLog('DRAWER', 'Alert de erro fechado pelo usuário');
              }
            );
          }
        } catch (error) {
          errorLog('DRAWER', '💥 EXCEÇÃO CAPTURADA NO LOGOUT', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
          
          showErrorAlert(
            'Erro Inesperado',
            `Erro inesperado ao fazer logout: ${error.message}`,
            () => {
              debugLog('DRAWER', 'Alert de exceção fechado pelo usuário');
            }
          );
        } finally {
          debugLog('DRAWER', '🏁 FINALIZANDO PROCESSO DE LOGOUT');
          debugLog('DRAWER', '⏰ Timestamp final:', new Date().toISOString());
          debugLog('DRAWER', '🔄 Desativando estado de loading...');
          
          setIsLoggingOut(false);
          
          debugLog('DRAWER', '✨ Estado de loading desativado');
          debugLog('DRAWER', '==========================================');
          debugLog('DRAWER', '📊 PROCESSO DE LOGOUT CONCLUÍDO');
          debugLog('DRAWER', '==========================================');
          
          // Timeout para limpar logs do estado após alguns segundos
          setTimeout(() => {
            debugLog('DRAWER', '🧹 Limpeza de logs de estado após 3 segundos');
          }, 3000);
        }
      },
      // Função onCancel (quando usuário cancela o logout)
      () => {
        debugLog('DRAWER', 'Logout cancelado pelo usuário');
      }
    );
  };

  const navigateTo = (screenName) => {
    debugLog('DRAWER', 'Tentativa de navegação:', {
      destino: screenName,
      isLoggingOut: isLoggingOut,
      timestamp: new Date().toISOString()
    });
    
    // Não navegar se estiver fazendo logout
    if (isLoggingOut) {
      debugLog('DRAWER', '⚠️ Navegação bloqueada - logout em andamento');
      return;
    }
    
    debugLog('DRAWER', '✅ Navegação autorizada para:', screenName);
    props.navigation.navigate(screenName);
    debugLog('DRAWER', '🚀 Comando de navegação executado');
  };

  const menuItems = [
    {
      label: 'Início',
      icon: 'home-outline',
      onPress: () => navigateTo('Main'),
      isActive: props.state.routeNames[props.state.index] === 'Main'
    },
    {
      label: 'Perfil',
      icon: 'person-outline',
      onPress: () => navigateTo('Profile'),
      isActive: props.state.routeNames[props.state.index] === 'Profile'
    },
    {
      label: 'Configurações',
      icon: 'settings-outline',
      onPress: () => navigateTo('Settings'),
      isActive: props.state.routeNames[props.state.index] === 'Settings'
    },
    {
      label: isLoggingOut ? 'Saindo...' : 'Sair',
      icon: 'log-out-outline',
      onPress: handleLogout,
      isActive: false,
      isLogout: true,
      disabled: isLoggingOut
    }
  ];

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.card,
      paddingTop: insets.top 
    }]}>
      {/* Header do Drawer com informações do usuário */}
      <View style={[styles.userInfoSection, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => navigateTo('Profile')}
          disabled={isLoggingOut}
        >
          {user?.photoURL ? (
            <Image 
              source={{ uri: user.photoURL || user.profilePicture }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.displayName || 'Usuário'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'email@exemplo.com'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ScrollView para os itens do menu */}
      <ScrollView 
        style={styles.menuScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.isActive && [styles.activeMenuItem, { backgroundColor: `${theme.colors.primary}20` }],
                item.isLogout && styles.logoutMenuItem,
                item.disabled && styles.disabledMenuItem
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
              disabled={item.disabled}
            >
              <View style={styles.menuItemContent}>
                {item.disabled ? (
                  <ActivityIndicator 
                    size="small" 
                    color={theme.colors.error} 
                    style={{ width: 24 }}
                  />
                ) : (
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={
                      item.isLogout 
                        ? theme.colors.error 
                        : item.isActive 
                          ? theme.colors.primary 
                          : theme.colors.text
                    } 
                  />
                )}
                <Text style={[
                  styles.menuItemLabel,
                  { 
                    color: item.isLogout 
                      ? theme.colors.error 
                      : item.isActive 
                        ? theme.colors.primary 
                        : theme.colors.text
                  }
                ]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer do Drawer */}
      <View style={[styles.bottomDrawerSection, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.appVersion, { color: theme.colors.secondaryText }]}>
          MovieBox v1.0.0
        </Text>
        {isLoggingOut && (
          <Text style={[styles.loggingOutText, { color: theme.colors.error }]}>
            Fazendo logout...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  userInfoSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Nunito_400Regular',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  menuScrollView: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  menuContent: {
    padding: 0,
    margin: 0,
  },
  menuSection: {
    paddingTop: 8,
    padding: 0,
    margin: 0,
  },
  menuItem: {
    marginHorizontal: 0,
    marginVertical: 2,
    borderRadius: 28,
    overflow: 'hidden',
  },
  activeMenuItem: {
    marginHorizontal: 12,
  },
  logoutMenuItem: {
    marginTop: 8,
  },
  disabledMenuItem: {
    opacity: 0.7,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'EncodeSansExpanded_400Regular',
    fontWeight: '500',
  },
  bottomDrawerSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 12,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  loggingOutText: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'EncodeSansExpanded_400Regular',
    fontStyle: 'italic',
  },
});