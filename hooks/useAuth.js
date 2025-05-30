// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { firebaseAuthService } from '../services/firebaseAuth';
import { debugLog, errorLog, successLog } from '../config/debugConfig';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Limpar erro após um tempo
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
        
        // Aguardar Firebase estar inicializado
        await firebaseAuthService.ensureInitialized();
        
        // Configurar listener de mudanças de autenticação
        unsubscribe = await firebaseAuthService.onAuthStateChanged((firebaseUser) => {
          debugLog('AUTH_HOOK', 'Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
          
          if (firebaseUser) {
            setUser(firebaseUser);
            debugLog('AUTH_HOOK', 'Usuário definido no estado', { uid: firebaseUser.uid, email: firebaseUser.email });
          } else {
            setUser(null);
            debugLog('AUTH_HOOK', 'Usuário removido do estado');
          }
          
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

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        debugLog('AUTH_HOOK', 'Removendo listener de autenticação');
        unsubscribe();
      }
    };
  }, [initializing]);

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    debugLog('AUTH_HOOK', 'Iniciando registro via hook', { name, email });
    
    try {
      const result = await firebaseAuthService.register(name, email, password);
      
      if (!result.success) {
        setError(result.error);
        debugLog('AUTH_HOOK', 'Registro falhou', { error: result.error });
      } else {
        successLog('AUTH_HOOK', 'Registro bem-sucedido via hook');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado no registro';
      setError(errorMessage);
      errorLog('AUTH_HOOK', 'Exceção no registro:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    debugLog('AUTH_HOOK', 'Iniciando login via hook', { email });
    
    try {
      const result = await firebaseAuthService.login(email, password);
      
      if (!result.success) {
        setError(result.error);
        debugLog('AUTH_HOOK', 'Login falhou', { error: result.error });
      } else {
        successLog('AUTH_HOOK', 'Login bem-sucedido via hook');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado no login';
      setError(errorMessage);
      errorLog('AUTH_HOOK', 'Exceção no login:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    debugLog('AUTH_HOOK', 'Iniciando logout via hook');
    
    try {
      const result = await firebaseAuthService.logout();
      
      if (result.success) {
        // Forçar limpeza local dos dados do usuário
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
      
      // Em caso de erro, forçar limpeza local
      setUser(null);
      debugLog('AUTH_HOOK', 'Limpeza forçada do usuário após erro');
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    setError(null);
    
    debugLog('AUTH_HOOK', 'Atualizando perfil via hook', { uid: user.uid, data });
    
    try {
      const result = await firebaseAuthService.updateUserProfile(user.uid, data);
      
      if (!result.success) {
        setError(result.error);
        debugLog('AUTH_HOOK', 'Atualização de perfil falhou', { error: result.error });
      } else {
        successLog('AUTH_HOOK', 'Perfil atualizado com sucesso via hook');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado ao atualizar perfil';
      setError(errorMessage);
      errorLog('AUTH_HOOK', 'Exceção na atualização de perfil:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async (imageUri, fileInfo = {}) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    setError(null);
    
    debugLog('AUTH_HOOK', 'Atualizando foto de perfil via hook', { uid: user.uid });
    
    try {
      const result = await firebaseAuthService.updateProfilePicture(user.uid, imageUri, fileInfo);
      
      if (!result.success) {
        setError(result.error);
        debugLog('AUTH_HOOK', 'Atualização de foto falhou', { error: result.error });
      } else {
        successLog('AUTH_HOOK', 'Foto de perfil atualizada com sucesso via hook');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado ao atualizar foto';
      setError(errorMessage);
      errorLog('AUTH_HOOK', 'Exceção na atualização de foto:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
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

  const deleteAccount = async (password) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    setError(null);
    
    debugLog('AUTH_HOOK', 'Tentativa de deletar conta via hook', { uid: user.uid });
    
    try {
      // Implementar se necessário
      debugLog('AUTH_HOOK', 'Função de deletar conta não implementada');
      return { success: false, error: 'Função não implementada' };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao deletar conta';
      setError(errorMessage);
      errorLog('AUTH_HOOK', 'Exceção ao deletar conta:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearAuthError = () => {
    debugLog('AUTH_HOOK', 'Limpando erro de autenticação');
    setError(null);
  };

  // Log do estado atual quando há mudanças significativas
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
    deleteAccount,
    clearAuthError
  };
};