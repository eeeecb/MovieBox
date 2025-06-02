import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { debugLog, errorLog, successLog, warnLog } from '../config/debugConfig';

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

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

const getStorageData = async (keys) => {
  try {
    const values = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
    return keys.reduce((acc, key, index) => {
      acc[key] = values[index];
      return acc;
    }, {});
  } catch (error) {
    errorLog('THEME', 'Erro ao carregar dados do storage:', error);
    return {};
  }
};

const saveThemeToStorage = async (preferences) => {
  try {
    debugLog('THEME', 'Salvando preferências de tema:', preferences);
    
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
    debugLog('THEME', 'Preferências salvas no AsyncStorage');
    
    return true;
  } catch (error) {
    errorLog('THEME', 'Erro ao salvar preferências de tema:', error);
    return false;
  }
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { user, updatePreferences, isAuthenticated } = useAuth();
  
  const [theme, setTheme] = useState(lightTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [lastManualTheme, setLastManualTheme] = useState('light');

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        debugLog('THEME', 'Carregando preferências de tema...');
        
        const storageKeys = ['@theme_preference', '@use_system_theme', '@last_manual_theme'];
        const storageData = await getStorageData(storageKeys);

        let themeToUse = 'light';
        let useSystemToUse = true;
        let lastManualToUse = 'light';

        if (storageData['@last_manual_theme']) {
          lastManualToUse = storageData['@last_manual_theme'];
          setLastManualTheme(lastManualToUse);
          debugLog('THEME', 'Último tema manual carregado do AsyncStorage:', lastManualToUse);
        }

        if (storageData['@use_system_theme'] !== null) {
          useSystemToUse = JSON.parse(storageData['@use_system_theme']);
          setUseSystemTheme(useSystemToUse);
          debugLog('THEME', 'Configuração useSystem carregada do AsyncStorage:', useSystemToUse);
        }

        if (storageData['@theme_preference'] && !useSystemToUse) {
          themeToUse = storageData['@theme_preference'];
          debugLog('THEME', 'Tema específico carregado do AsyncStorage:', themeToUse);
        }

        if (isAuthenticated && user?.preferences && user?.firestoreAvailable !== false) {
          try {
            const { theme: cloudTheme, useSystem: cloudUseSystem, lastManual: cloudLastManual } = user.preferences;
            
            debugLog('THEME', 'Preferências da nuvem encontradas:', { cloudTheme, cloudUseSystem, cloudLastManual });
            
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
            
            successLog('THEME', 'Preferências da nuvem aplicadas com sucesso');
          } catch (error) {
            warnLog('THEME', 'Erro ao carregar preferências da nuvem: ' + error.message);
          }
        }

        const newTheme = useSystemToUse 
          ? (systemColorScheme === 'dark' ? darkTheme : lightTheme)
          : (themeToUse === 'dark' ? darkTheme : lightTheme);
        
        setTheme(newTheme);
        debugLog('THEME', 'Tema aplicado:', newTheme.name);

      } catch (error) {
        errorLog('THEME', 'Erro ao carregar preferência de tema:', error);
        const fallbackTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
        setTheme(fallbackTheme);
        debugLog('THEME', 'Tema fallback aplicado:', fallbackTheme.name);
      } finally {
        setIsThemeLoaded(true);
        debugLog('THEME', 'Carregamento de tema concluído');
      }
    };

    loadThemePreference();
  }, [systemColorScheme, isAuthenticated, user]);

  useEffect(() => {
    if (useSystemTheme && systemColorScheme) {
      const newTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
      setTheme(newTheme);
      debugLog('THEME', 'Tema atualizado automaticamente pelo sistema:', newTheme.name);
    }
  }, [systemColorScheme, useSystemTheme]);

  const saveThemePreferences = async (preferences) => {
    await saveThemeToStorage(preferences);
    
    if (isAuthenticated && updatePreferences && user?.firestoreAvailable !== false) {
      try {
        await updatePreferences({
          ...user.preferences,
          ...preferences
        });
        successLog('THEME', 'Preferências de tema salvas na nuvem');
      } catch (firebaseError) {
        warnLog('THEME', 'Não foi possível salvar no Firebase: ' + firebaseError.message);
        
        if (firebaseError.message?.includes('permission')) {
          warnLog('THEME', 'Configure as regras do Firestore para sincronizar preferências');
        }
      }
    }
  };

  const applyTheme = (themeName, isSystemTheme = false) => {
    const newTheme = themeName === 'dark' ? darkTheme : lightTheme;
    setTheme(newTheme);
    
    if (!isSystemTheme) {
      setLastManualTheme(themeName);
    }
  };

  const setDarkTheme = async () => {
    try {
      debugLog('THEME', 'Definindo tema escuro');
      applyTheme('dark');
      setUseSystemTheme(false);
      
      await saveThemePreferences({
        theme: 'dark',
        useSystem: false,
        lastManual: 'dark'
      });
    } catch (error) {
      errorLog('THEME', 'Erro ao definir tema escuro:', error);
    }
  };

  const setLightTheme = async () => {
    try {
      debugLog('THEME', 'Definindo tema claro');
      applyTheme('light');
      setUseSystemTheme(false);
      
      await saveThemePreferences({
        theme: 'light',
        useSystem: false,
        lastManual: 'light'
      });
    } catch (error) {
      errorLog('THEME', 'Erro ao definir tema claro:', error);
    }
  };

  const setSystemTheme = async (useSystem) => {
    try {
      debugLog('THEME', 'Configurando tema do sistema:', useSystem);
      setUseSystemTheme(useSystem);
      
      if (useSystem) {
        applyTheme(systemColorScheme, true);
        
        await saveThemePreferences({ useSystem: true });
      } else {
        applyTheme(lastManualTheme);
        
        await saveThemePreferences({
          theme: lastManualTheme,
          useSystem: false
        });
      }
    } catch (error) {
      errorLog('THEME', 'Erro ao definir tema do sistema:', error);
    }
  };

  useEffect(() => {
    if (isThemeLoaded) {
      debugLog('THEME', 'Estado atual do Theme Context:', {
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
      firestoreAvailable: user?.firestoreAvailable !== false
    }}>
      {children}
    </ThemeContext.Provider>
  );
};