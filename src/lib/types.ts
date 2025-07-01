export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: UserLevel;
  achievements: Achievement[];
  monthlyLimit: number;
  totalSaved: number;
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
  category: string;
  logo?: string;
  address?: string;
}

export interface Purchase {
  id: string;
  storeId?: string;
  userId: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  status: "pending" | "paid";
  paidAt?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: "savings" | "investment" | "purchase" | "debt" | "other";
  priority: "low" | "medium" | "high";
  createdAt: string;
  completed: boolean;
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
