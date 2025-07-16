'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storeService, purchaseService, goalService } from '@/services/api';
import type { Store, Purchase, Goal } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface DataContextType {
  stores: Store[];
  purchases: Purchase[];
  goals: Goal[];
  isLoading: boolean;
  addStore: (store: Omit<Store, 'id'>) => Promise<void>;
  // Adicione outras funções de dados aqui...
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (isAuthenticated && user?.id) {
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
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Não foi possível carregar os dados da aplicação.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addStore = useCallback(async (store: Omit<Store, 'id'>) => {
    try {
      const newStore = await storeService.create(store);
      setStores(prev => [...prev, newStore]);
      toast.success('Loja adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar loja:', error);
      toast.error('Não foi possível adicionar a loja.');
    }
  }, []);

  const value = {
    stores,
    purchases,
    goals,
    isLoading,
    addStore,
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