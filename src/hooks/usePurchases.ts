import { useState, useEffect } from "react";

export interface Purchase {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui você faria uma chamada para a API para buscar as compras
    // Por enquanto, vamos usar dados de exemplo
    setPurchases([
      {
        id: "1",
        description: "Supermercado",
        amount: 350.5,
        date: "2024-03-15",
        category: "Alimentação",
      },
      {
        id: "2",
        description: "Netflix",
        amount: 39.9,
        date: "2024-03-14",
        category: "Entretenimento",
      },
      {
        id: "3",
        description: "Conta de luz",
        amount: 180.0,
        date: "2024-03-13",
        category: "Moradia",
      },
    ]);
    setLoading(false);
  }, []);

  return { purchases, loading };
}
