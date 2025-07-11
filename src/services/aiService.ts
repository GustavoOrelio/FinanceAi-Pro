import type { Purchase, Goal } from "@/lib/types";

// Tipos
interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  explanation: string;
}

interface PersonalizedRecommendation {
  type: "saving" | "investment" | "budget" | "general";
  title: string;
  description: string;
  potentialImpact: string;
  priority: "high" | "medium" | "low";
}

interface ConsumptionPattern {
  category: string;
  pattern: string;
  insight: string;
  suggestion: string;
}

// Funções auxiliares
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("app-state");
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    }
    const error = await response.json();
    throw new Error(error.message || "Erro na requisição");
  }
  const newToken = response.headers.get("x-new-token");
  if (newToken) {
    localStorage.setItem("token", newToken);
  }
  return response.json();
};

// Serviço de IA
export const aiService = {
  // Chat existente
  chat: async (data: { message: string; context: any; history: any[] }) => {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Nova função para prever gastos futuros
  predictSpending: async (
    historicalPurchases: Purchase[],
    categories: string[]
  ): Promise<SpendingPrediction[]> => {
    try {
      const purchasesByCategory = categories.map((category) => ({
        category,
        purchases: historicalPurchases
          .filter((p) => p.category === category)
          .map((p) => ({ amount: p.amount, date: p.date })),
      }));

      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: "predictions",
          data: {
            purchasesByCategory,
            userId: localStorage.getItem("userId"),
          },
        }),
      });

      const { result } = await handleResponse(response);
      return result;
    } catch (error) {
      console.error("Erro ao gerar previsões:", error);
      throw new Error("Falha ao gerar previsões de gastos");
    }
  },

  getRecommendations: async (
    purchases: Purchase[],
    goals: Goal[],
    monthlyLimit: number
  ): Promise<PersonalizedRecommendation[]> => {
    try {
      const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);
      const goalProgress = goals.map((g) => ({
        title: g.title,
        progress: (g.currentAmount / g.targetAmount) * 100,
      }));

      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: "recommendations",
          data: {
            totalSpent,
            monthlyLimit,
            goalProgress,
            userId: localStorage.getItem("userId"),
          },
        }),
      });

      const { result } = await handleResponse(response);
      return result;
    } catch (error) {
      console.error("Erro ao gerar recomendações:", error);
      throw new Error("Falha ao gerar recomendações personalizadas");
    }
  },

  analyzeConsumptionPatterns: async (
    purchases: Purchase[]
  ): Promise<ConsumptionPattern[]> => {
    try {
      const purchasesByCategory = purchases.reduce(
        (acc, purchase) => {
          if (!acc[purchase.category]) {
            acc[purchase.category] = [];
          }
          acc[purchase.category].push({
            amount: purchase.amount,
            date: purchase.date,
            description: purchase.description,
          });
          return acc;
        },
        {} as Record<string, any[]>
      );

      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: "patterns",
          data: {
            purchasesByCategory,
            userId: localStorage.getItem("userId"),
          },
        }),
      });
      const { result } = await handleResponse(response);
      return result;
    } catch (error) {
      console.error("Erro ao analisar padrões:", error);
      throw new Error("Falha ao analisar padrões de consumo");
    }
  },
};
