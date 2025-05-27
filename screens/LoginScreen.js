// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const { login, register, loading } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setFormError('');
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  const validateForm = () => {
    if (!email || !password) {
      setFormError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (!email.includes('@')) {
      setFormError('Por favor, insira um email válido');
      return false;
    }

    if (password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (!isLoginMode) {
      if (!name) {
        setFormError('Por favor, insira seu nome');
        return false;
      }

      if (password !== confirmPassword) {
        setFormError('As senhas não coincidem');
        return false;
      }
    }

    setFormError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let result;
      
      if (isLoginMode) {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
      }

      if (!result.success) {
        setFormError(result.error || 'Erro na autenticação');
      }
    } catch (error) {
      setFormError(error.message || 'Erro inesperado');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.appTitle, { color: theme.colors.primary }]}>
              MovieBox
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
              {isLoginMode ? 'Entre na sua conta' : 'Crie sua conta'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
              {isLoginMode ? 'Login' : 'Registro'}
            </Text>

            {/* Error Message */}
            {formError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            {/* Name Field (apenas no registro) */}
            {!isLoginMode && (
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={theme.colors.secondaryText} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="Nome completo"
                  placeholderTextColor={theme.colors.secondaryText}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={theme.colors.secondaryText} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text
                  }
                ]}
                placeholder="Email"
                placeholderTextColor={theme.colors.secondaryText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCompleteType="email"
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={theme.colors.secondaryText} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text
                  }
                ]}
                placeholder="Senha"
                placeholderTextColor={theme.colors.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCompleteType="password"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={theme.colors.secondaryText} 
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Field (apenas no registro) */}
            {!isLoginMode && (
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={theme.colors.secondaryText} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="Confirmar senha"
                  placeholderTextColor={theme.colors.secondaryText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLoginMode ? 'Entrar' : 'Registrar'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Mode Button */}
            <TouchableOpacity style={styles.switchModeButton} onPress={switchMode}>
              <Text style={[styles.switchModeText, { color: theme.colors.primary }]}>
                {isLoginMode 
                  ? 'Não tem uma conta? Registre-se' 
                  : 'Já tem uma conta? Faça login'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Exo_700Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  formCard: {
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Nunito_400Regular',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 16,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'EncodeSansExpanded_500Medium',
  },
  switchModeButton: {
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    fontFamily: 'EncodeSansExpanded_400Regular',
  },
});