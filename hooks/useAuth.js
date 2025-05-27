// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { firebaseAuthService } from '../services/firebaseAuth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      setError(err.message);
      return { success: false, error: err.message };
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
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseAuthService.logout();
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
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
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile
  };
};