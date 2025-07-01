'use client';

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AppState, AppStateUpdate, User, Purchase, Store, Goal } from '@/lib/types';

interface AppContextType extends AppState {
  updateState: (update: AppStateUpdate) => void;
  toggleDarkMode: () => void;
  login: (user: User) => void;
  logout: () => void;
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (purchaseId: string, updates: Purchase) => void;
  removePurchase: (purchaseId: string) => void;
  addStore: (store: Store) => void;
  updateStore: (storeId: string, updates: Store) => void;
  removeStore: (storeId: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Goal) => void;
  removeGoal: (goalId: string) => void;
  setMonthlyLimit: (limit: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<AppState>('app-state', {
    user: null,
    stores: [],
    purchases: [],
    goals: [],
    darkMode: false,
    monthlyLimit: 0,
    isAuthenticated: false,
  });

  // Efeito para aplicar o tema
  useEffect(() => {
    const root = window.document.documentElement;
    if (state.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.darkMode]);

  const updateState = useCallback((update: AppStateUpdate) => {
    setState(prev => ({
      ...prev,
      ...update,
    }));
  }, [setState]);

  const toggleDarkMode = useCallback(() => {
    updateState({ darkMode: !state.darkMode });
  }, [state.darkMode, updateState]);

  const login = useCallback((user: User) => {
    updateState({
      user,
      isAuthenticated: true,
    });
  }, [updateState]);

  const logout = useCallback(() => {
    updateState({
      user: null,
      isAuthenticated: false,
    });
  }, [updateState]);

  const addPurchase = useCallback((purchase: Purchase) => {
    updateState({
      purchases: [...state.purchases, purchase],
    });
  }, [state.purchases, updateState]);

  const updatePurchase = useCallback((purchaseId: string, updates: Purchase) => {
    updateState({
      purchases: state.purchases.map(p =>
        p.id === purchaseId ? { ...p, ...updates } : p
      ),
    });
  }, [state.purchases, updateState]);

  const removePurchase = useCallback((purchaseId: string) => {
    updateState({
      purchases: state.purchases.filter(p => p.id !== purchaseId),
    });
  }, [state.purchases, updateState]);

  const addStore = useCallback((store: Store) => {
    updateState({
      stores: [...state.stores, store],
    });
  }, [state.stores, updateState]);

  const updateStore = useCallback((storeId: string, updates: Store) => {
    updateState({
      stores: state.stores.map(s =>
        s.id === storeId ? { ...s, ...updates } : s
      ),
    });
  }, [state.stores, updateState]);

  const removeStore = useCallback((storeId: string) => {
    updateState({
      stores: state.stores.filter(s => s.id !== storeId),
    });
  }, [state.stores, updateState]);

  const addGoal = useCallback((goal: Goal) => {
    updateState({
      goals: [...state.goals, goal],
    });
  }, [state.goals, updateState]);

  const updateGoal = useCallback((goalId: string, updates: Goal) => {
    updateState({
      goals: state.goals.map(g =>
        g.id === goalId ? { ...g, ...updates } : g
      ),
    });
  }, [state.goals, updateState]);

  const removeGoal = useCallback((goalId: string) => {
    updateState({
      goals: state.goals.filter(g => g.id !== goalId),
    });
  }, [state.goals, updateState]);

  const setMonthlyLimit = useCallback((limit: number) => {
    updateState({ monthlyLimit: limit });
  }, [updateState]);

  const value: AppContextType = {
    ...state,
    updateState,
    toggleDarkMode,
    login,
    logout,
    addPurchase,
    updatePurchase,
    removePurchase,
    addStore,
    updateStore,
    removeStore,
    addGoal,
    updateGoal,
    removeGoal,
    setMonthlyLimit,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 