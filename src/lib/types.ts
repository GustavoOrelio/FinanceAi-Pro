export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLevel {
  current: number;
  experience: number;
  nextLevelThreshold: number;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  category: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  storeId: string;
  userId: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  date: Date;
  category: string;
  description: string;
  status: string;
  installments?: number;
  createdAt: Date;
  updatedAt: Date;
  store?: Store;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  purchaseId: string;
  amount: number;
  method: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category: string;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface AppState {
  user: User | null;
  stores: Store[];
  purchases: Purchase[];
  goals: Goal[];
  darkMode: boolean;
  monthlyLimit: number;
  isAuthenticated: boolean;
}

export type AppStateUpdate = Partial<AppState>;

export interface AuthResponse {
  user: User;
  token: string;
}
