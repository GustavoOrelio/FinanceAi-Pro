export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
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
}

export interface Purchase {
  id: string;
  storeId: string;
  userId: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  date: string;
  category: string;
  description: string;
  status: "pending" | "partially_paid" | "paid";
  payments: Payment[];
  installments?: number;
}

export interface Payment {
  id: string;
  purchaseId: string;
  amount: number;
  method: "pix" | "credit" | "debit" | "cash";
  date: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  completedAt?: string;
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
