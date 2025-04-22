// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    csrfToken: localStorage.getItem('csrfToken') || null,
    usuario: null,
  });
  
  const navigate = useNavigate();

  // Decodifica o token e atualiza o estado do usuário
  const updateUserFromToken = (token) => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuthState(prev => ({ ...prev, usuario: decoded }));
      } catch (error) {
        logout();
      }
    }
  };

  // Armazena o token CSRF
  const setCsrfToken = (token) => {
    localStorage.setItem('csrfToken', token);
    setAuthState(prev => ({ ...prev, csrfToken: token }));
  };

  // Efeito para decodificar o token ao carregar
  useEffect(() => {
    if (authState.accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authState.accessToken}`;
      updateUserFromToken(authState.accessToken);
    }
  
  }, [authState.accessToken, authState.csrfToken]);
  

  // Função de login: armazena ambos os tokens
  const login = async (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  
    // Setar Authorization globalmente
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  
    setAuthState(prev => ({ 
      ...prev, 
      accessToken, 
      refreshToken,
      usuario: null 
    }));
    updateUserFromToken(accessToken);
  };

  const logout = () => {
    // Limpa todos os tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('csrfToken');
    setAuthState({ 
      accessToken: null, 
      refreshToken: null, 
      csrfToken: null,
      usuario: null 
    });
    navigate('/');
  };

  // Verifica se o usuário está autenticado
  const isAuthenticated = () => {
    if (!authState.accessToken) return false;
    
    try {
      const decoded = jwtDecode(authState.accessToken);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      setCsrfToken,
      login, 
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};