'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AppState, AppStateUpdate, User, Purchase, Store, Goal, Payment } from '@/lib/types';
import { userService, storeService, purchaseService, goalService, paymentService, authService } from '@/services/api';
import { toast } from 'sonner';

interface AppContextType extends AppState {
  updateState: (update: AppStateUpdate) => void;
  toggleDarkMode: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => Promise<void>;
  updatePurchase: (purchaseId: string, updates: Partial<Purchase>) => Promise<void>;
  removePurchase: (purchaseId: string) => Promise<void>;
  addStore: (store: Omit<Store, 'id'>) => Promise<void>;
  updateStore: (storeId: string, updates: Partial<Store>) => Promise<void>;
  removeStore: (storeId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (goalId: string) => Promise<void>;
  setMonthlyLimit: (limit: number) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading: boolean;
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
  initialData?: Partial<AppState>;
}

const initialState: AppState = {
  user: null,
  stores: [],
  purchases: [],
  goals: [],
  darkMode: false,
  monthlyLimit: 0,
  isAuthenticated: false,
};

export function AppProvider({ children, initialData }: AppProviderProps) {
  const [state, setState] = useLocalStorage<AppState>(
    'app-state',
    { ...initialState, ...initialData }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Efeito para marcar quando a hidratação foi completada
  useEffect(() => {
    // Aguarda um pouco para garantir que o localStorage foi carregado
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

  // Efeito para verificar token no localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && state.isAuthenticated) {
      logout();
    }
  }, []);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      loadInitialData();
    }
  }, [state.isAuthenticated, state.user?.id]);

  const loadInitialData = async () => {
    if (!state.user?.id) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      return;
    }

    try {
      await authService.verifyToken();
    } catch (error) {
      console.error('loadInitialData: Erro na verificação do token:', error);
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      logout();
      return;
    }

    setIsLoading(true);
    try {
      const [stores, purchases, goals] = await Promise.all([
        storeService.getAll(),
        purchaseService.getByUser(state.user.id),
        goalService.getByUser(state.user.id),
      ]);

      setState(current => ({
        ...current,
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
    setState(current => {
      const newState = { ...current, ...update };
      return newState;
    });
  }, [setState]);

  const toggleDarkMode = useCallback(() => {
    updateState({ darkMode: !state.darkMode });
  }, [state.darkMode, updateState]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user, token } = await authService.login(email, password);
      localStorage.setItem('token', token);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateState({ user, isAuthenticated: true });
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadInitialData();
      toast.success('Login realizado com sucesso');
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Email ou senha inválidos');
      throw error;
    }
  }, [updateState]);

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    try {
      const { user, token } = await authService.register(data);

      // Primeiro salvamos o token
      localStorage.setItem('token', token);

      // Aumentamos o delay para garantir que o token foi salvo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Depois atualizamos o estado
      updateState({ user, isAuthenticated: true });

      // Outro pequeno delay antes de carregar os dados
      await new Promise(resolve => setTimeout(resolve, 100));

      // Por fim carregamos os dados
      await loadInitialData();

      toast.success('Cadastro realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer cadastro:', error);
      toast.error('Erro ao fazer cadastro');
      throw error;
    }
  }, [updateState]);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('app-state');
    localStorage.removeItem('token');
    setState({ ...initialState });
    toast.success('Logout realizado com sucesso');
  }, [setState]);

  const addPurchase = useCallback(async (purchase: Omit<Purchase, 'id'>) => {
    if (!state.user?.id) {
      toast.error('Você precisa estar logado para adicionar uma compra');
      return;
    }

    try {
      const newPurchase = await purchaseService.create({
        ...purchase,
        userId: state.user.id,
      });
      setState(current => ({
        ...current,
        purchases: [...current.purchases, newPurchase],
      }));
      toast.success('Compra adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
      toast.error('Erro ao adicionar compra');
      throw error;
    }
  }, [state.user?.id, setState]);

  const updatePurchase = useCallback(async (purchaseId: string, updates: Partial<Purchase>) => {
    try {
      const updatedPurchase = await purchaseService.update(purchaseId, updates);
      setState(current => ({
        ...current,
        purchases: current.purchases.map(p =>
          p.id === purchaseId ? updatedPurchase : p
        ),
      }));
      toast.success('Compra atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar compra:', error);
      toast.error('Erro ao atualizar compra');
      throw error;
    }
  }, [setState]);

  const removePurchase = useCallback(async (purchaseId: string) => {
    try {
      await purchaseService.delete(purchaseId);
      setState(current => ({
        ...current,
        purchases: current.purchases.filter(p => p.id !== purchaseId),
      }));
      toast.success('Compra removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover compra:', error);
      toast.error('Erro ao remover compra');
      throw error;
    }
  }, [setState]);

  const addStore = useCallback(async (store: Omit<Store, 'id'>) => {
    try {
      const newStore = await storeService.create(store);
      setState(current => ({
        ...current,
        stores: [...current.stores, newStore],
      }));
      toast.success('Loja adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar loja:', error);
      toast.error('Erro ao adicionar loja');
      throw error;
    }
  }, [setState]);

  const updateStore = useCallback(async (storeId: string, updates: Partial<Store>) => {
    try {
      const updatedStore = await storeService.update(storeId, updates);
      setState(current => ({
        ...current,
        stores: current.stores.map(s =>
          s.id === storeId ? updatedStore : s
        ),
      }));
      toast.success('Loja atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar loja:', error);
      toast.error('Erro ao atualizar loja');
      throw error;
    }
  }, [setState]);

  const removeStore = useCallback(async (storeId: string) => {
    try {
      await storeService.delete(storeId);
      setState(current => ({
        ...current,
        stores: current.stores.filter(s => s.id !== storeId),
      }));
      toast.success('Loja removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover loja:', error);
      toast.error('Erro ao remover loja');
      throw error;
    }
  }, [setState]);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id'>) => {
    try {
      const newGoal = await goalService.create(goal);
      setState(current => ({
        ...current,
        goals: [...current.goals, newGoal],
      }));
      toast.success('Meta adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      toast.error('Erro ao adicionar meta');
      throw error;
    }
  }, [setState]);

  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    try {
      const updatedGoal = await goalService.update(goalId, updates);
      setState(current => ({
        ...current,
        goals: current.goals.map(g =>
          g.id === goalId ? updatedGoal : g
        ),
      }));
      toast.success('Meta atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
      throw error;
    }
  }, [setState]);

  const removeGoal = useCallback(async (goalId: string) => {
    try {
      await goalService.delete(goalId);
      setState(current => ({
        ...current,
        goals: current.goals.filter(g => g.id !== goalId),
      }));
      toast.success('Meta removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover meta:', error);
      toast.error('Erro ao remover meta');
      throw error;
    }
  }, [setState]);

  const setMonthlyLimit = useCallback(async (limit: number) => {
    if (!state.user?.id) return;

    try {
      await userService.update(state.user.id, { monthlyLimit: limit });
      setState(current => ({
        ...current,
        monthlyLimit: limit,
      }));
      toast.success('Limite mensal atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar limite mensal:', error);
      toast.error('Erro ao atualizar limite mensal');
      throw error;
    }
  }, [state.user?.id, setState]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPayment = await paymentService.create(payment);

      // Atualiza o estado da compra
      const purchase = state.purchases.find(p => p.id === payment.purchaseId);
      if (purchase) {
        const newPaidAmount = (purchase.paidAmount || 0) + payment.amount;
        const newRemainingAmount = Math.max(0, purchase.amount - newPaidAmount);
        const newStatus = newRemainingAmount === 0 ? 'paid' : 'partially_paid';

        await updatePurchase(purchase.id, {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          payments: [...(purchase.payments || []), newPayment],
        });
      }

      toast.success('Pagamento registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
      throw error;
    }
  }, [state.purchases, updatePurchase]);

  const value = {
    ...state,
    updateState,
    toggleDarkMode,
    login,
    register,
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
    addPayment,
    isLoading,
    isHydrated,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 