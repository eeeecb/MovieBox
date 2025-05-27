// src/components/CustomDrawerContent.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';

export default function CustomDrawerContent(props) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <DrawerContentScrollView {...props}>
        {/* Header do Drawer com informações do usuário */}
        <View style={[styles.userInfoSection, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => props.navigation.navigate('Profile')}
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

        {/* Itens do menu */}
        <View style={styles.drawerSection}>
          <DrawerItemList {...props} />
          
          {/* Item customizado para logout */}
          <DrawerItem
            label="Sair"
            onPress={handleLogout}
            icon={({ color, size }) => (
              <Ionicons name="log-out-outline" size={size} color={color} />
            )}
            labelStyle={{ color: theme.colors.text }}
            activeBackgroundColor="transparent"
          />
        </View>
      </DrawerContentScrollView>

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
  },
  userInfoSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
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
  drawerSection: {
    marginTop: 8,
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