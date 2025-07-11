'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Store, Purchase, Goal } from '@/lib/types';
import { useAuth } from './AuthContext';
import { storeService, purchaseService, goalService } from '@/services/api';
import { toast } from 'sonner';

interface DataContextType {
  stores: Store[];
  purchases: Purchase[];
  goals: Goal[];
  monthlyLimit: number;
  darkMode: boolean;
  isLoading: boolean;
  setStores: (stores: Store[]) => void;
  setPurchases: (purchases: Purchase[]) => void;
  setGoals: (goals: Goal[]) => void;
  addStore: (store: Store) => void;
  updateStore: (store: Store) => void;
  deleteStore: (storeId: string) => void;
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (purchase: Purchase) => void;
  removePurchase: (purchaseId: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  setMonthlyLimit: (limit: number) => void;
  toggleDarkMode: () => void;
  loadInitialData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('monthlyLimit');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const loadInitialData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const [storesData, purchasesData, goalsData] = await Promise.all([
        storeService.getAll(),
        purchaseService.getByUser(user.id),
        goalService.getByUser(user.id),
      ]);

      setStores(storesData);
      setPurchases(purchasesData);
      setGoals(goalsData);

      // Load saved monthly limit
      const savedLimit = localStorage.getItem('monthlyLimit');
      if (savedLimit) {
        setMonthlyLimit(Number(savedLimit));
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    } else {
      // Clear data when not authenticated
      setStores([]);
      setPurchases([]);
      setGoals([]);
      setMonthlyLimit(0);
    }
  }, [isAuthenticated, user, loadInitialData]);

  // Store operations
  const addStore = useCallback((store: Store) => {
    setStores(prev => [...prev, store]);
  }, []);

  const updateStore = useCallback((store: Store) => {
    setStores(prev => prev.map(s => s.id === store.id ? store : s));
  }, []);

  const deleteStore = useCallback((storeId: string) => {
    setStores(prev => prev.filter(s => s.id !== storeId));
  }, []);

  // Purchase operations
  const addPurchase = useCallback((purchase: Purchase) => {
    setPurchases(prev => [...prev, purchase]);
  }, []);

  const updatePurchase = useCallback((purchase: Purchase) => {
    setPurchases(prev => prev.map(p => p.id === purchase.id ? purchase : p));
  }, []);

  const removePurchase = useCallback((purchaseId: string) => {
    setPurchases(prev => prev.filter(p => p.id !== purchaseId));
  }, []);

  // Goal operations
  const addGoal = useCallback((goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  }, []);

  const updateGoal = useCallback((goal: Goal) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  }, []);

  // Theme toggle
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      return newValue;
    });
  }, []);

  const value = {
    stores,
    purchases,
    goals,
    monthlyLimit,
    darkMode,
    isLoading,
    setStores,
    setPurchases,
    setGoals,
    addStore,
    updateStore,
    deleteStore,
    addPurchase,
    updatePurchase,
    removePurchase,
    addGoal,
    updateGoal,
    deleteGoal,
    setMonthlyLimit,
    toggleDarkMode,
    loadInitialData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 