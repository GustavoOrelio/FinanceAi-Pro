'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import type { User, Store, Purchase, Goal } from '@/lib/types';
import * as firebaseService from '@/services/firebase';
import { useAuth } from './AuthContext';

interface AppState {
  user: User | null;
  stores: Store[];
  purchases: Purchase[];
  goals: Goal[];
  darkMode: boolean;
  monthlyLimit: number;
}

type AppStateUpdate = Partial<AppState>;

interface AppContextType extends AppState {
  isLoading: boolean;
  updateState: (update: AppStateUpdate) => void;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  user: null,
  stores: [],
  purchases: [],
  goals: [],
  darkMode: false,
  monthlyLimit: 0,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<AppState>('app-state', initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user: authUser, isAuthenticated } = useAuth();

  // Efeito para marcar quando a hidratação foi completada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Efeito para aplicar o tema
  useEffect(() => {
    const root = window.document.documentElement;
    if (state.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Efeito para carregar dados iniciais quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadInitialData();
    } else {
      // Limpa os dados quando o usuário não está autenticado
      setState(initialState);
    }
  }, [isAuthenticated, authUser]);

  const loadInitialData = async () => {
    if (!authUser?.id) return;

    setIsLoading(true);
    try {
      const [stores, purchases, goals] = await Promise.all([
        firebaseService.getUserStores(authUser.id),
        firebaseService.getUserPurchases(authUser.id),
        firebaseService.getUserGoals(authUser.id),
      ]);

      setState(current => ({
        ...current,
        user: authUser,
        stores,
        purchases,
        goals,
      }));
    } catch (error) {
      console.error('loadInitialData: Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateState = useCallback((update: AppStateUpdate) => {
    setState(current => ({ ...current, ...update }));
  }, [setState]);

  const toggleDarkMode = useCallback(() => {
    updateState({ darkMode: !state.darkMode });
  }, [state.darkMode, updateState]);

  const value = {
    ...state,
    isLoading,
    updateState,
    toggleDarkMode,
  };

  // Não renderiza nada até a hidratação estar completa
  if (!isHydrated) {
    return null;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 