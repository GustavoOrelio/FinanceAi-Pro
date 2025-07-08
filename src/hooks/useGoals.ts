import { useState, useEffect } from "react";

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui você faria uma chamada para a API para buscar as metas
    // Por enquanto, vamos usar dados de exemplo
    setGoals([
      {
        id: "1",
        title: "Viagem para a Europa",
        targetAmount: 15000,
        currentAmount: 5000,
        deadline: "2024-12-31",
      },
      {
        id: "2",
        title: "Fundo de emergência",
        targetAmount: 10000,
        currentAmount: 7500,
        deadline: "2024-06-30",
      },
    ]);
    setLoading(false);
  }, []);

  return { goals, loading };
}
