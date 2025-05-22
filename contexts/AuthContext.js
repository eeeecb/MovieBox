import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Criar o contexto
const AuthContext = createContext();

// Hook personalizado para usar autenticação
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do AsyncStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_data');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Função para login
  const login = async (userData) => {
    try {
      // Verificar se os dados do usuário foram fornecidos corretamente
      if (!userData || !userData.email || !userData.password) {
        throw new Error('Dados de login incompletos');
      }
      
      // Buscar usuários registrados
      const registeredUsersJSON = await AsyncStorage.getItem('@registered_users');
      const registeredUsers = registeredUsersJSON ? JSON.parse(registeredUsersJSON) : [];
      
      // Verificar credenciais
      const foundUser = registeredUsers.find(
        user => user.email === userData.email && user.password === userData.password
      );
      
      if (!foundUser) {
        throw new Error('Credenciais inválidas');
      }
      
      // Criar objeto de usuário para o estado (sem incluir a senha)
      const userToStore = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        profilePicture: foundUser.profilePicture || null,
        createdAt: foundUser.createdAt,
      };
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('@user_data', JSON.stringify(userToStore));
      
      // Atualizar estado
      setUser(userToStore);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, error: error.message };
    }
  };

  // Função para registro de novo usuário
  const register = async (userData) => {
    try {
      // Verificar se os dados do usuário foram fornecidos corretamente
      if (!userData || !userData.name || !userData.email || !userData.password) {
        throw new Error('Dados de registro incompletos');
      }
      
      // Buscar usuários já registrados
      const registeredUsersJSON = await AsyncStorage.getItem('@registered_users');
      const registeredUsers = registeredUsersJSON ? JSON.parse(registeredUsersJSON) : [];
      
      // Verificar se já existe um usuário com o mesmo email
      if (registeredUsers.some(user => user.email === userData.email)) {
        throw new Error('Email já cadastrado');
      }
      
      // Criar objeto de usuário com senha
      const newUser = {
        id: Date.now().toString(), // Simular um ID único
        name: userData.name,
        email: userData.email,
        password: userData.password, // Em um app real, isso seria hashado
        profilePicture: null,
        createdAt: new Date().toISOString(),
      };
      
      // Adicionar ao array de usuários registrados
      registeredUsers.push(newUser);
      await AsyncStorage.setItem('@registered_users', JSON.stringify(registeredUsers));
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { success: false, error: error.message };
    }
  };

  // Função para logout
  const logout = async () => {
    try {
      console.log('Iniciando logout no AuthContext');
      // Remover dados do usuário do AsyncStorage
      await AsyncStorage.removeItem('@user_data');
      console.log('Dados do usuário removidos do AsyncStorage');
      
      // Limpar estado
      setUser(null);
      console.log('Estado do usuário limpo com sucesso');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { success: false, error: error.message };
    }
  };

  // Função para atualizar foto de perfil
  const updateProfilePicture = async (imageUri) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar objeto do usuário com a nova foto
      const updatedUser = {
        ...user,
        profilePicture: imageUri
      };
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
      
      // Atualizar o usuário nos registrados também
      const registeredUsersJSON = await AsyncStorage.getItem('@registered_users');
      if (registeredUsersJSON) {
        const registeredUsers = JSON.parse(registeredUsersJSON);
        const userIndex = registeredUsers.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
          registeredUsers[userIndex].profilePicture = imageUri;
          await AsyncStorage.setItem('@registered_users', JSON.stringify(registeredUsers));
        }
      }
      
      // Atualizar estado
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      return { success: false, error: error.message };
    }
  };

  // Função para atualizar dados do usuário
  const updateUserData = async (userData) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar objeto do usuário com os novos dados
      const updatedUser = {
        ...user,
        ...userData
      };
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
      
      // Atualizar o usuário nos registrados também
      const registeredUsersJSON = await AsyncStorage.getItem('@registered_users');
      if (registeredUsersJSON) {
        const registeredUsers = JSON.parse(registeredUsersJSON);
        const userIndex = registeredUsers.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
          registeredUsers[userIndex] = {
            ...registeredUsers[userIndex],
            ...userData
          };
          await AsyncStorage.setItem('@registered_users', JSON.stringify(registeredUsers));
        }
      }
      
      // Atualizar estado
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return { success: false, error: error.message };
    }
  };

  // Adicionar usuário padrão se não existir nenhum (para facilitar testes)
  useEffect(() => {
    const addDefaultUser = async () => {
      try {
        const registeredUsersJSON = await AsyncStorage.getItem('@registered_users');
        
        if (!registeredUsersJSON || JSON.parse(registeredUsersJSON).length === 0) {
          const defaultUser = {
            id: '1',
            name: 'Usuário Teste',
            email: 'usuario@teste.com',
            password: '123456',
            profilePicture: null,
            createdAt: new Date().toISOString(),
          };
          
          await AsyncStorage.setItem('@registered_users', JSON.stringify([defaultUser]));
          console.log('Usuário padrão adicionado');
        }
      } catch (error) {
        console.error('Erro ao adicionar usuário padrão:', error);
      }
    };
    
    addDefaultUser();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfilePicture,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};