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

// Serviço de IA
export const aiService = {
  // Chat existente
  chat: async (data: { message: string; context: any; history: any[] }) => {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Nova função para prever gastos futuros
  predictSpending: async (
    historicalPurchases: Purchase[],
    categories: string[]
  ): Promise<SpendingPrediction[]> => {
    try {
      // Prepara os dados históricos para análise
      const purchasesByCategory = categories.map((category) => {
        const purchases = historicalPurchases.filter(
          (p) => p.category === category
        );
        return {
          category,
          purchases: purchases.map((p) => ({
            amount: p.amount,
            date: p.date,
          })),
        };
      });

      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type: "predictions",
          data: {
            purchasesByCategory,
            userId: localStorage.getItem("userId"),
          },
        }),
      });

      const { result } = await response.json();
      return result;
    } catch (error) {
      console.error("Erro ao gerar previsões:", error);
      throw new Error("Falha ao gerar previsões de gastos");
    }
  },

  // Nova função para gerar recomendações personalizadas
  getRecommendations: async (
    purchases: Purchase[],
    goals: Goal[],
    monthlyLimit: number
  ): Promise<PersonalizedRecommendation[]> => {
    try {
      // Calcula métricas importantes
      const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);
      const goalProgress = goals.map((g) => ({
        title: g.title,
        progress: (g.currentAmount / g.targetAmount) * 100,
      }));

      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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

      const { result } = await response.json();
      return result;
    } catch (error) {
      console.error("Erro ao gerar recomendações:", error);
      throw new Error("Falha ao gerar recomendações personalizadas");
    }
  },

  // Nova função para analisar padrões de consumo
  analyzeConsumptionPatterns: async (
    purchases: Purchase[]
  ): Promise<ConsumptionPattern[]> => {
    try {
      // Agrupa compras por categoria
      const purchasesByCategory = purchases.reduce((acc, purchase) => {
        if (!acc[purchase.category]) {
          acc[purchase.category] = [];
        }
        acc[purchase.category].push({
          amount: purchase.amount,
          date: purchase.date,
          description: purchase.description,
        });
        return acc;
      }, {} as Record<string, any[]>);

      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type: "patterns",
          data: {
            purchasesByCategory,
            userId: localStorage.getItem("userId"),
          },
        }),
      });

      const { result } = await response.json();
      return result;
    } catch (error) {
      console.error("Erro ao analisar padrões:", error);
      throw new Error("Falha ao analisar padrões de consumo");
    }
  },
};
