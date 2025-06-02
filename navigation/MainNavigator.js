import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MovieScreen from '../screens/MovieScreen';
import ActorScreen from '../screens/ActorScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const STACK_SCREEN_OPTIONS = { headerShown: false };
const DRAWER_WIDTH = 280;

const AuthLoadingScreen = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.text }]}>
        Verificando autenticação...
      </Text>
    </View>
  );
};

const createMovieStack = (initialScreen, name) => (
  <Stack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
    <Stack.Screen name={name} component={initialScreen} />
    <Stack.Screen name="MovieDetails" component={MovieScreen} />
    <Stack.Screen name="ActorProfile" component={ActorScreen} />
  </Stack.Navigator>
);

const MoviesStack = () => createMovieStack(HomeScreen, "Home");
const FavoritesStack = () => createMovieStack(FavoritesScreen, "FavoritesList");

const getTabIcon = (route, focused) => {
  const icons = {
    MoviesTab: focused ? 'film' : 'film-outline',
    Favorites: focused ? 'heart' : 'heart-outline'
  };
  return icons[route.name];
};

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons 
            name={getTabIcon(route, focused)} 
            size={size} 
            color={color} 
          />
        ),
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
};

const createDrawerScreen = (name, component, label, iconName) => (
  <Drawer.Screen 
    key={name}
    name={name} 
    component={component}
    options={{
      drawerLabel: label,
      drawerIcon: ({ color, size }) => (
        <Ionicons name={iconName} size={size} color={color} />
      ),
    }}
  />
);

const DrawerNavigator = () => {
  const { theme } = useTheme();

  const drawerScreens = [
    { name: 'Main', component: TabNavigator, label: 'Início', icon: 'home-outline' },
    { name: 'Profile', component: ProfileScreen, label: 'Perfil', icon: 'person-outline' },
    { name: 'Settings', component: SettingsScreen, label: 'Configurações', icon: 'settings-outline' }
  ];

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.card,
          width: DRAWER_WIDTH,
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
      {drawerScreens.map(screen => 
        createDrawerScreen(screen.name, screen.component, screen.label, screen.icon)
      )}
    </Drawer.Navigator>
  );
};

const MainStack = () => {
  const { isAuthenticated, loading, isInitializing } = useAuth();

  if (isInitializing || loading) {
    return <AuthLoadingScreen />;
  }

  const screenConfig = isAuthenticated 
    ? { name: "DrawerNav", component: DrawerNavigator, animation: 'push' }
    : { name: "Login", component: LoginScreen, animation: 'pop' };

  return (
    <Stack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
      <Stack.Screen 
        name={screenConfig.name} 
        component={screenConfig.component}
        options={{ animationTypeForReplace: screenConfig.animation }}
      />
    </Stack.Navigator>
  );
};

const createNavigationTheme = (theme, isDark) => ({
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
});

export default function MainNavigator() {
  const { theme, isDark } = useTheme();
  const navigationTheme = createNavigationTheme(theme, isDark);

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