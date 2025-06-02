import React, { useState, useMemo } from 'react';
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

const UserAvatar = React.memo(({ user, styles }) => {
  const avatarKey = useMemo(() => 
    `${user?.uid || 'default'}-${user?.photoURL || 'no-photo'}-${Date.now()}`, 
    [user?.uid, user?.photoURL]
  );

  if (user?.photoURL) {
    return (
      <Image 
        key={avatarKey}
        source={{ uri: user.photoURL }} 
        style={styles.avatar} 
      />
    );
  }
  
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>
        {user?.displayName?.charAt(0)?.toUpperCase() || 
         user?.email?.charAt(0)?.toUpperCase() || 'U'}
      </Text>
    </View>
  );
});

const MenuItem = ({ item, theme, onPress, isLoggingOut }) => {
  const getIconColor = () => {
    if (item.isLogout) return theme.colors.error;
    return item.isActive ? theme.colors.primary : theme.colors.text;
  };

  const getLabelColor = () => getIconColor();

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        item.isActive && [styles.activeMenuItem, { backgroundColor: `${theme.colors.primary}20` }],
        item.isLogout && styles.logoutMenuItem,
        item.disabled && styles.disabledMenuItem
      ]}
      onPress={onPress}
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
            color={getIconColor()} 
          />
        )}
        <Text style={[styles.menuItemLabel, { color: getLabelColor() }]}>
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function CustomDrawerContent(props) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userDisplayName = useMemo(() => 
    user?.displayName || 'Usuário', 
    [user?.displayName]
  );

  const userEmail = useMemo(() => 
    user?.email || 'email@exemplo.com', 
    [user?.email]
  );

  const logDebugInfo = (message, data = {}) => {
    debugLog('DRAWER', message, {
      timestamp: new Date().toISOString(),
      ...data
    });
  };

  const navigateTo = (screenName) => {
    logDebugInfo('Tentativa de navegação:', {
      destino: screenName,
      isLoggingOut: isLoggingOut
    });
    
    if (isLoggingOut) {
      debugLog('DRAWER', '⚠️ Navegação bloqueada - logout em andamento');
      return;
    }
    
    debugLog('DRAWER', '✅ Navegação autorizada para:', screenName);
    props.navigation.navigate(screenName);
    debugLog('DRAWER', '🚀 Comando de navegação executado');
  };

  const executeLogout = async () => {
    debugLog('DRAWER', '==========================================');
    debugLog('DRAWER', '🚀 INICIANDO PROCESSO DE LOGOUT');
    debugLog('DRAWER', '==========================================');
    
    logDebugInfo('Estado antes do logout:', {
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
      
      logDebugInfo(`⏱️ Tempo de execução do logout: ${endTime - startTime}ms`, {
        success: result?.success,
        error: result?.error
      });
      
      if (result?.success) {
        successLog('DRAWER', 'LOGOUT BEM-SUCEDIDO!');
        debugLog('DRAWER', '🎯 Usuário deve ser redirecionado automaticamente');
        debugLog('DRAWER', '🧹 Limpeza de estado local realizada');
      } else {
        errorLog('DRAWER', 'FALHA NO LOGOUT');
        debugLog('DRAWER', '🚨 Erro reportado:', result?.error);
        debugLog('DRAWER', '📱 Exibindo alert de erro para o usuário');
        
        showErrorAlert(
          'Erro no Logout',
          result?.error || 'Erro ao fazer logout. Tente novamente.',
          () => debugLog('DRAWER', 'Alert de erro fechado pelo usuário')
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
        () => debugLog('DRAWER', 'Alert de exceção fechado pelo usuário')
      );
    } finally {
      debugLog('DRAWER', '🏁 FINALIZANDO PROCESSO DE LOGOUT');
      logDebugInfo('Desativando estado de loading...');
      
      setIsLoggingOut(false);
      
      debugLog('DRAWER', '✨ Estado de loading desativado');
      debugLog('DRAWER', '==========================================');
      debugLog('DRAWER', '📊 PROCESSO DE LOGOUT CONCLUÍDO');
      debugLog('DRAWER', '==========================================');
      
      setTimeout(() => {
        debugLog('DRAWER', '🧹 Limpeza de logs de estado após 3 segundos');
      }, 3000);
    }
  };

  const handleLogout = () => {
    logDebugInfo('Botão de logout pressionado', {
      email: user?.email,
      displayName: user?.displayName,
      uid: user?.uid
    });
    
    showLogoutConfirm(
      executeLogout,
      () => debugLog('DRAWER', 'Logout cancelado pelo usuário')
    );
  };

  const createMenuItem = (label, icon, screenName, isLogout = false) => ({
    label: isLoggingOut && isLogout ? 'Saindo...' : label,
    icon,
    onPress: isLogout ? handleLogout : () => navigateTo(screenName),
    isActive: !isLogout && props.state.routeNames[props.state.index] === screenName,
    isLogout,
    disabled: isLoggingOut && isLogout
  });

  const menuItems = [
    createMenuItem('Início', 'home-outline', 'Main'),
    createMenuItem('Perfil', 'person-outline', 'Profile'),
    createMenuItem('Configurações', 'settings-outline', 'Settings'),
    createMenuItem('Sair', 'log-out-outline', null, true)
  ];

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.card,
      paddingTop: insets.top 
    }]}>
      <View style={[styles.userInfoSection, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => navigateTo('Profile')}
          disabled={isLoggingOut}
        >
          <UserAvatar user={user} styles={styles} />
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {userDisplayName}
            </Text>
            <Text style={styles.userEmail}>
              {userEmail}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.menuScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              item={item}
              theme={theme}
              onPress={item.onPress}
              isLoggingOut={isLoggingOut}
            />
          ))}
        </View>
      </ScrollView>

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