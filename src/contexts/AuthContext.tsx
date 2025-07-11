'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '@/lib/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  getToken: () => string | null;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem('token', newToken);
  }, []);

  const getToken = useCallback(() => {
    return token;
  }, [token]);

  const login = useCallback((userData: User, newToken: string) => {
    try {
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Login realizado com sucesso');
    } catch (error) {
      console.error('Erro ao processar login:', error);
      toast.error('Erro ao processar login');
      throw error;
    }
  }, [setToken]);

  const logout = useCallback(() => {
    try {
      setUser(null);
      setTokenState(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao processar logout:', error);
      toast.error('Erro ao processar logout');
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      try {
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        toast.error('Erro ao atualizar usuário');
        return prev;
      }
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user && !!token,
    token,
    login,
    logout,
    updateUser,
    getToken,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 