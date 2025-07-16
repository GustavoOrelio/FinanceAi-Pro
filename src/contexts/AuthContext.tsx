'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import * as firebaseService from '@/services/firebase';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Observa mudanças no estado de autenticação do Firebase
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          // Busca dados adicionais do usuário no Firestore
          const userData = await firebaseService.getUserById(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // Se não encontrar dados do usuário, faz logout
            await firebaseService.logout();
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          toast.error('Erro ao carregar dados do usuário');
          await firebaseService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const firebaseUser = await firebaseService.login(email, password);
      const userData = await firebaseService.getUserById(firebaseUser.uid);
      if (!userData) {
        throw new Error('Usuário não encontrado');
      }
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error('Email ou senha inválidos');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      // Cria o usuário no Firebase Authentication
      const firebaseUser = await firebaseService.signUp(data.email, data.password);

      // Cria o perfil do usuário no Firestore
      await firebaseService.createUser({
        id: firebaseUser.uid,
        name: data.name,
        email: data.email,
        xp: 0,
      });

      toast.success('Cadastro realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      toast.error('Erro ao realizar o cadastro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await firebaseService.logout();
      toast.success('Você saiu da sua conta');
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao sair da conta');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 