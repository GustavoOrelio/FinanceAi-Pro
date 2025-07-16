export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  monthlyLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  category: string;
  logo?: string;
  createdById: string;
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
  payments?: Payment[];
  installments?: number;
  createdAt: Date;
  updatedAt: Date;
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

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIContext {
  monthlySpending: number;
  monthlyLimit?: number;
  goals?: Array<{
    title: string;
    progress: number;
  }>;
  recentTransactions?: Array<{
    description: string;
    amount: number;
    date: string;
  }>;
}

export interface AIRequest {
  message: string;
  context: AIContext;
  history: AIMessage[];
}

export interface AIResponse {
  response: string;
}

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}
