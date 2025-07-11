// Tipos
import type { User, Store, Purchase, Goal, Payment } from "@/lib/types";
import { aiService as AIServiceFromModule } from "./aiService";

// Funções auxiliares
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      console.error(
        "Erro de autenticação:",
        response.status,
        response.statusText,
        "\nURL:",
        response.url
      );
      throw new Error("Sessão expirada");
    }
    const error = await response.json();
    console.error(
      "Erro na requisição:",
      response.status,
      response.statusText,
      error,
      "\nURL:",
      response.url
    );
    throw new Error(error.message || "Erro na requisição");
  }

  // Verifica se há um novo token no header
  const newToken = response.headers.get("x-new-token");
  if (newToken) {
    localStorage.setItem("token", newToken);
  }

  return response.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Serviços de Autenticação
export const authService = {
  login: async (email: string, password: string) => {
    console.log("authService.login: Iniciando login");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    console.log(
      "authService.login: Resposta recebida, status:",
      response.status
    );
    return handleResponse(response);
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  logout: () => {
    // Removido o localStorage.removeItem("token") pois agora é gerenciado pelo AuthContext
  },

  verifyToken: async () => {
    const response = await fetch("/api/auth/verify", {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  forgotPassword: async (email: string) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  resetPassword: async (token: string, password: string) => {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    return handleResponse(response);
  },
};

// Serviço de Stores
export const storeService = {
  getAll: async () => {
    const response = await fetch("/api/stores", {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (store: Omit<Store, "id">) => {
    const response = await fetch("/api/stores", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(store),
    });
    return handleResponse(response);
  },

  update: async (id: string, store: Partial<Store>) => {
    const response = await fetch(`/api/stores/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(store),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/stores/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Serviço de Purchases
export const purchaseService = {
  getByUser: async (userId: string) => {
    const response = await fetch(`/api/purchases?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (purchase: Omit<Purchase, "id">) => {
    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(purchase),
    });
    return handleResponse(response);
  },

  update: async (id: string, purchase: Partial<Purchase>) => {
    const response = await fetch(`/api/purchases/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(purchase),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/purchases/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Serviço de Goals
export const goalService = {
  getByUser: async (userId: string) => {
    const response = await fetch(`/api/goals?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (goal: Omit<Goal, "id">) => {
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(goal),
    });
    return handleResponse(response);
  },

  update: async (id: string, goal: Partial<Goal>) => {
    const response = await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(goal),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/goals/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Serviço de Payments
export const paymentService = {
  create: async (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">) => {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payment),
    });
    return handleResponse(response);
  },
};

// Re-export do aiService
export const aiService = AIServiceFromModule;
