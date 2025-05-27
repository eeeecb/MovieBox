// src/components/CustomDrawerContent.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomDrawerContent(props) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

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

  const navigateTo = (screenName) => {
    props.navigation.navigate(screenName);
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
      label: 'Sair',
      icon: 'log-out-outline',
      onPress: handleLogout,
      isActive: false,
      isLogout: true
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
        >
          {user?.photoURL ? (
            <Image 
              source={{ uri: user.photoURL }} 
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
                item.isLogout && styles.logoutMenuItem
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
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
    fontFamily: 'Ramabhadra_400Regular',
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
});