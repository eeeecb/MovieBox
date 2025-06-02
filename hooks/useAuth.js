import { useState, useEffect, useCallback } from 'react';
import { firebaseAuthService } from '../services/firebaseAuth';
import { debugLog, errorLog, successLog } from '../config/debugConfig';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const clearError = useCallback(() => {
    if (error) {
      setTimeout(() => setError(null), 5000);
    }
  }, [error]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    let unsubscribe = null;
    
    const setupAuthListener = async () => {
      try {
        debugLog('AUTH_HOOK', 'Configurando listener de autenticação...');
        
        await firebaseAuthService.ensureInitialized();
        
        unsubscribe = await firebaseAuthService.onAuthStateChanged((firebaseUser) => {
          debugLog('AUTH_HOOK', 'Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
          
          setUser(firebaseUser);
          
          if (initializing) {
            setInitializing(false);
            debugLog('AUTH_HOOK', 'Inicialização concluída');
          }
          setLoading(false);
        });
        
        successLog('AUTH_HOOK', 'Listener de autenticação configurado');
      } catch (error) {
        errorLog('AUTH_HOOK', 'Erro ao configurar listener de autenticação:', error);
        setError('Erro ao inicializar autenticação');
        setInitializing(false);
        setLoading(false);
      }
    };

    setupAuthListener();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        debugLog('AUTH_HOOK', 'Removendo listener de autenticação');
        unsubscribe();
      }
    };
  }, [initializing]);

  const handleAuthAction = async (action, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await action(...args);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    debugLog('AUTH_HOOK', 'Iniciando registro via hook', { name, email });
    return handleAuthAction(firebaseAuthService.register, name, email, password);
  };

  const login = async (email, password) => {
    debugLog('AUTH_HOOK', 'Iniciando login via hook', { email });
    return handleAuthAction(firebaseAuthService.login, email, password);
  };

  const logout = async () => {
    debugLog('AUTH_HOOK', 'Iniciando logout via hook');
    
    try {
      const result = await firebaseAuthService.logout();
      
      if (result.success) {
        setUser(null);
        successLog('AUTH_HOOK', 'Logout concluído com sucesso via hook');
      } else {
        setError(result.error);
        errorLog('AUTH_HOOK', 'Erro no logout:', result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado no logout';
      setError(errorMessage);
      errorLog('AUTH_HOOK', 'Exceção no logout:', err);
      
      setUser(null);
      debugLog('AUTH_HOOK', 'Limpeza forçada do usuário após erro');
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    debugLog('AUTH_HOOK', 'Atualizando perfil via hook', { uid: user.uid, data });
    return handleAuthAction(firebaseAuthService.updateUserProfile, user.uid, data);
  };

  const updateProfilePicture = async (imageUri, fileInfo = {}) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    debugLog('AUTH_HOOK', 'Atualizando foto de perfil via hook', { uid: user.uid });
    return handleAuthAction(firebaseAuthService.updateProfilePicture, user.uid, imageUri, fileInfo);
  };

  const updatePreferences = async (preferences) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    debugLog('AUTH_HOOK', 'Atualizando preferências via hook', { uid: user.uid, preferences });
    
    try {
      const result = await firebaseAuthService.updateUserPreferences(user.uid, preferences);
      
      if (result.success) {
        successLog('AUTH_HOOK', 'Preferências atualizadas com sucesso via hook');
      } else {
        debugLog('AUTH_HOOK', 'Atualização de preferências falhou', { error: result.error });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar preferências';
      setError(errorMessage);
      errorLog('AUTH_HOOK', 'Exceção na atualização de preferências:', err);
      return { success: false, error: errorMessage };
    }
  };

  const clearAuthError = () => {
    debugLog('AUTH_HOOK', 'Limpando erro de autenticação');
    setError(null);
  };

  useEffect(() => {
    debugLog('AUTH_HOOK', 'Estado do hook atualizado:', {
      hasUser: !!user,
      loading: loading || initializing,
      hasError: !!error,
      isAuthenticated: !!user,
      isInitializing: initializing
    });
  }, [user, loading, error, initializing]);

  return {
    user,
    loading: loading || initializing,
    error,
    isAuthenticated: !!user,
    isInitializing: initializing,
    register,
    login,
    logout,
    updateProfile,
    updateProfilePicture,
    updatePreferences,
    clearAuthError
  };
};