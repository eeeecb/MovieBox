// navigation/MainNavigator.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importar telas
import HomeScreen from '../screens/HomeScreen';
import MovieScreen from '../screens/MovieScreen';
import ActorScreen from '../screens/ActorScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Importar contextos/hooks
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';

// Importar componente do Drawer customizado
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Componente de Loading para autenticação
function AuthLoadingScreen() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.text }]}>
        Verificando autenticação...
      </Text>
    </View>
  );
}

// Stack de navegação para filmes
function MoviesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MovieDetails" component={MovieScreen} />
      <Stack.Screen name="ActorProfile" component={ActorScreen} />
    </Stack.Navigator>
  );
}

// Stack de navegação para favoritos
function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesList" component={FavoritesScreen} />
      <Stack.Screen name="MovieDetails" component={MovieScreen} />
      <Stack.Screen name="ActorProfile" component={ActorScreen} />
    </Stack.Navigator>
  );
}

// Navegação por tabs (principal)
function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'MoviesTab') {
            iconName = focused ? 'film' : 'film-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: { 
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: 'EncodeSansExpanded_400Regular',
        },
      })}
    >
      <Tab.Screen 
        name="MoviesTab" 
        component={MoviesStack} 
        options={{ tabBarLabel: 'Filmes' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesStack} 
        options={{ tabBarLabel: 'Favoritos' }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator (quando usuário está autenticado)
function DrawerNavigator() {
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.card,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerItemStyle: {
          marginHorizontal: 0,
          paddingHorizontal: 12,
          marginVertical: 4,
        },
        drawerLabelStyle: {
          marginLeft: -16,
          fontFamily: 'EncodeSansExpanded_400Regular',
        },
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={TabNavigator}
        options={{
          drawerLabel: 'Início',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerLabel: 'Perfil',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerLabel: 'Configurações',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Stack Navigator principal
function MainStack() {
  const { isAuthenticated, loading, isInitializing } = useAuth();

  // Mostrar loading enquanto inicializa ou está carregando
  if (isInitializing || loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Usuário autenticado
        <Stack.Screen 
          name="DrawerNav" 
          component={DrawerNavigator}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : (
        // Usuário não autenticado
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </Stack.Navigator>
  );
}

// Componente principal do navegador
export default function MainNavigator() {
  const { theme, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <MainStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
});