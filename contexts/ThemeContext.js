// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

// Definição dos temas
export const lightTheme = {
  name: 'light',
  colors: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    secondaryText: '#666666',
    primary: '#1E88E5',
    accent: '#FF4081',
    border: '#E0E0E0',
    error: '#F44336',
    success: '#4CAF50',
    divider: '#EEEEEE',
    headerBackground: '#FFFFFF',
    inputBackground: '#FFFFFF',
    inputBorder: '#DDDDDD',
    tabBar: '#FFFFFF',
    tabBarInactive: '#757575',
  }
};

export const darkTheme = {
  name: 'dark',
  colors: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#F5F5F5',
    secondaryText: '#AAAAAA',
    primary: '#2196F3',
    accent: '#FF4081',
    border: '#333333',
    error: '#F44336',
    success: '#4CAF50',
    divider: '#333333',
    headerBackground: '#1E1E1E',
    inputBackground: '#2A2A2A',
    inputBorder: '#444444',
    tabBar: '#1E1E1E',
    tabBarInactive: '#AAAAAA',
  }
};

// Criar o contexto
const ThemeContext = createContext();

// Hook personalizado para usar o tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { user, updatePreferences, isAuthenticated } = useAuth();
  
  const [theme, setTheme] = useState(lightTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [lastManualTheme, setLastManualTheme] = useState('light');

  // Carregar preferências de tema
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // Sempre carregar do AsyncStorage primeiro (para compatibilidade)
        const [storedTheme, storedUseSystem, storedLastManual] = await Promise.all([
          AsyncStorage.getItem('@theme_preference'),
          AsyncStorage.getItem('@use_system_theme'),
          AsyncStorage.getItem('@last_manual_theme')
        ]);

        // Configurar valores padrão
        let themeToUse = 'light';
        let useSystemToUse = true;
        let lastManualToUse = 'light';

        // Se há dados do AsyncStorage, usar
        if (storedLastManual) {
          lastManualToUse = storedLastManual;
          setLastManualTheme(storedLastManual);
        }

        if (storedUseSystem !== null) {
          useSystemToUse = JSON.parse(storedUseSystem);
          setUseSystemTheme(useSystemToUse);
        }

        if (storedTheme && !useSystemToUse) {
          themeToUse = storedTheme;
        }

        // Se usuário logado e Firestore disponível, tentar usar preferências da nuvem
        if (isAuthenticated && user?.preferences && user?.firestoreAvailable !== false) {
          try {
            const { theme: cloudTheme, useSystem: cloudUseSystem, lastManual: cloudLastManual } = user.preferences;
            
            if (cloudUseSystem !== undefined) {
              useSystemToUse = cloudUseSystem;
              setUseSystemTheme(cloudUseSystem);
            }
            
            if (cloudLastManual) {
              lastManualToUse = cloudLastManual;
              setLastManualTheme(cloudLastManual);
            }
            
            if (!cloudUseSystem && cloudTheme) {
              themeToUse = cloudTheme;
            }
          } catch (error) {
            console.warn('Erro ao carregar preferências da nuvem:', error);
            // Continuar com dados locais
          }
        }

        // Aplicar tema
        if (useSystemToUse) {
          setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
        } else {
          setTheme(themeToUse === 'dark' ? darkTheme : lightTheme);
        }

      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
        // Usar padrões em caso de erro
        setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadThemePreference();
  }, [systemColorScheme, isAuthenticated, user]);

  // Atualizar tema com base no sistema quando useSystemTheme é true
  useEffect(() => {
    if (useSystemTheme && systemColorScheme) {
      setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
    }
  }, [systemColorScheme, useSystemTheme]);

  // Salvar preferências (com fallback robusto)
  const saveThemePreferences = async (preferences) => {
    try {
      // Sempre salvar no AsyncStorage primeiro (garantia)
      const { theme: themeValue, useSystem, lastManual } = preferences;
      
      const savePromises = [];
      
      if (themeValue !== undefined) {
        savePromises.push(AsyncStorage.setItem('@theme_preference', themeValue));
      }
      if (useSystem !== undefined) {
        savePromises.push(AsyncStorage.setItem('@use_system_theme', JSON.stringify(useSystem)));
      }
      if (lastManual !== undefined) {
        savePromises.push(AsyncStorage.setItem('@last_manual_theme', lastManual));
      }
      
      await Promise.all(savePromises);
      
      // Tentar salvar no Firebase se disponível
      if (isAuthenticated && updatePreferences && user?.firestoreAvailable !== false) {
        try {
          await updatePreferences({
            ...user.preferences,
            ...preferences
          });
          console.log('Preferências de tema salvas na nuvem');
        } catch (firebaseError) {
          console.warn('Não foi possível salvar no Firebase:', firebaseError.message);
          
          // Se for erro de permissão, mostrar aviso discreto
          if (firebaseError.message?.includes('permission')) {
            console.warn('💡 Configure as regras do Firestore para sincronizar preferências');
          }
          
          // Continuar - dados foram salvos localmente
        }
      }
    } catch (error) {
      console.error('Erro ao salvar preferências de tema:', error);
      // Não interromper fluxo - tema já foi aplicado visualmente
    }
  };

  const setDarkTheme = async () => {
    try {
      setTheme(darkTheme);
      setUseSystemTheme(false);
      setLastManualTheme('dark');
      
      // Salvar preferências de forma assíncrona
      saveThemePreferences({
        theme: 'dark',
        useSystem: false,
        lastManual: 'dark'
      });
    } catch (error) {
      console.error('Erro ao definir tema escuro:', error);
    }
  };

  const setLightTheme = async () => {
    try {
      setTheme(lightTheme);
      setUseSystemTheme(false);
      setLastManualTheme('light');
      
      // Salvar preferências de forma assíncrona
      saveThemePreferences({
        theme: 'light',
        useSystem: false,
        lastManual: 'light'
      });
    } catch (error) {
      console.error('Erro ao definir tema claro:', error);
    }
  };

  const setSystemTheme = async (useSystem) => {
    try {
      setUseSystemTheme(useSystem);
      
      if (useSystem) {
        const newTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
        setTheme(newTheme);
        
        // Salvar preferências de forma assíncrona
        saveThemePreferences({
          useSystem: true
        });
      } else {
        const themeToRestore = lastManualTheme === 'dark' ? darkTheme : lightTheme;
        setTheme(themeToRestore);
        
        // Salvar preferências de forma assíncrona
        saveThemePreferences({
          theme: lastManualTheme,
          useSystem: false
        });
      }
    } catch (error) {
      console.error('Erro ao definir tema do sistema:', error);
    }
  };

  // Debug info (apenas em desenvolvimento)
  useEffect(() => {
    if (__DEV__ && isThemeLoaded) {
      console.log('🎨 Theme Context:', {
        currentTheme: theme.name,
        useSystemTheme,
        lastManualTheme,
        userAuthenticated: isAuthenticated,
        firestoreAvailable: user?.firestoreAvailable
      });
    }
  }, [theme, useSystemTheme, lastManualTheme, isAuthenticated, user, isThemeLoaded]);

  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      theme,
      isDark: theme.name === 'dark',
      setDarkTheme,
      setLightTheme,
      useSystemTheme,
      setSystemTheme,
      lastManualTheme,
      // Info adicional para debug
      firestoreAvailable: user?.firestoreAvailable !== false
    }}>
      {children}
    </ThemeContext.Provider>
  );
};