// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { firebaseAuthService } from '../services/firebaseAuth';

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
    const unsubscribe = firebaseAuthService.onAuthStateChanged((firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      
      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initializing]);

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseAuthService.register(name, email, password);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado no registro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseAuthService.login(email, password);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado no login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando logout...');
      const result = await firebaseAuthService.logout();
      
      if (result.success) {
        // Forçar limpeza local dos dados do usuário
        setUser(null);
        console.log('Logout concluído com sucesso');
      } else {
        setError(result.error);
        console.error('Erro no logout:', result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado no logout';
      setError(errorMessage);
      console.error('Erro no logout:', err);
      
      // Em caso de erro, forçar limpeza local
      setUser(null);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseAuthService.updateUserProfile(user.uid, data);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado ao atualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async (imageUri, fileInfo = {}) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseAuthService.updateProfilePicture(user.uid, imageUri, fileInfo);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado ao atualizar foto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (preferences) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    try {
      const result = await firebaseAuthService.updateUserPreferences(user.uid, preferences);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar preferências';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteAccount = async (password) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseAuthService.deleteAccount(password);
      
      if (result.success) {
        setUser(null);
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao deletar conta';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearAuthError = () => {
    setError(null);
  };

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