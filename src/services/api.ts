// Tipos
import type { User, Store, Purchase, Goal, Payment } from "@/lib/types";

// Funções auxiliares
const handleResponse = async (response: Response) => {
  console.log(
    "handleResponse: Status da resposta:",
    response.status,
    response.statusText
  );

  if (!response.ok) {
    if (response.status === 401) {
      console.error(
        "Erro de autenticação:",
        response.status,
        response.statusText,
        "\nURL:",
        response.url
      );
      // Remove o token e estado do localStorage
      console.log("handleResponse: Removendo token e estado do localStorage");
      localStorage.removeItem("token");
      localStorage.removeItem("app-state");
      // Força o reload da página para limpar o estado
      console.log("handleResponse: Redirecionando para página de login");
      window.location.href = "/login";
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
  return response.json();
};

const getAuthHeaders = () => {
  console.log("getAuthHeaders: Obtendo token do localStorage");
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("getAuthHeaders: Token não encontrado no localStorage");
    throw new Error("Token inválido");
  }

  // Obtém o estado da aplicação para pegar o ID do usuário
  const appState = localStorage.getItem("app-state");
  let userId = "";
  if (appState) {
    try {
      const state = JSON.parse(appState);
      userId = state.user?.id || "";
    } catch (error) {
      console.error("getAuthHeaders: Erro ao parsear app-state:", error);
    }
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-user-id": userId,
  };
  console.log("getAuthHeaders: Headers configurados:", {
    ...headers,
    Authorization: headers.Authorization.substring(0, 20) + "...", // Mostra apenas parte do token
    "x-user-id": userId,
  });
  return headers;
};

const verifyAuthToken = async () => {
  console.log("verifyAuthToken: Verificando token...");
  const headers = getAuthHeaders();
  const response = await fetch("/api/auth/verify", { headers });
  if (!response.ok) {
    console.error("verifyAuthToken: Token inválido");
    localStorage.removeItem("token");
    localStorage.removeItem("app-state");
    throw new Error("Sessão expirada");
  }
  console.log("verifyAuthToken: Token válido");
  return response.json();
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
    const data = await handleResponse(response);
    console.log("authService.login: Login bem sucedido, salvando token");
    localStorage.setItem("token", data.token);
    return data;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    localStorage.setItem("token", result.token);
    return result;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  verifyToken: verifyAuthToken,
};

// Serviços de Usuário
export const userService = {
  create: async (data: Omit<User, "id" | "xp">) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Serviços de Loja
export const storeService = {
  create: async (data: Omit<Store, "id">) => {
    const response = await fetch("/api/stores", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Store>) => {
    const response = await fetch(`/api/stores/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
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

  getAll: async () => {
    const response = await fetch("/api/stores", {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/stores/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Serviços de Compra
export const purchaseService = {
  create: async (data: Omit<Purchase, "id">) => {
    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Purchase>) => {
    const response = await fetch(`/api/purchases/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
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

  getAll: async () => {
    const response = await fetch("/api/purchases", {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/purchases/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getByUser: async (userId: string) => {
    const response = await fetch(`/api/purchases?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Serviços de Meta
export const goalService = {
  create: async (data: Omit<Goal, "id">) => {
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Goal>) => {
    const response = await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
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

  getAll: async () => {
    const response = await fetch("/api/goals", {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/goals/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getByUser: async (userId: string) => {
    const response = await fetch("/api/goals", {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Serviços de Pagamento
export const paymentService = {
  create: async (data: Omit<Payment, "id">) => {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getByPurchase: async (purchaseId: string) => {
    const response = await fetch(`/api/payments?purchaseId=${purchaseId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
