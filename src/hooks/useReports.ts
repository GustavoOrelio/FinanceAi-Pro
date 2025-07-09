import { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Purchase } from "@/lib/types";

interface CategoryTotal {
  [key: string]: number;
}

interface ChartDataItem {
  month: string;
  total: number;
  categories: CategoryTotal;
}

interface CategoryDataItem {
  category: string;
  total: number;
}

interface TrendAnalysis {
  category: string;
  total: number;
  percentual: number;
  variacao: number;
  status: "up" | "down" | "stable";
}

interface DayAnalysis {
  dayOfWeek: string;
  total: number;
  count: number;
  average: number;
}

interface StoreAnalysis {
  store: string;
  total: number;
  count: number;
  average: number;
  lastPurchase: Date;
}

export interface ReportData {
  chartData: ChartDataItem[];
  categoryData: CategoryDataItem[];
  totalGasto: number;
  mediaGastoMensal: number;
  categoriasMaisGastos: CategoryDataItem[];
  maiorGastoUnico: Purchase;
  tendencias: TrendAnalysis[];
  diasMaisGastos: DayAnalysis[];
  lojasMaisFrequentes: StoreAnalysis[];
  metricasImportantes: {
    totalCompras: number;
    ticketMedio: number;
    maiorMes: { mes: string; valor: number };
    menorMes: { mes: string; valor: number };
    gastosPendentes: number;
    totalParcelado: number;
    percentualParcelado: number;
    categoriaEmAlta: string;
    categoriaEmBaixa: string;
  };
  previsaoProximoMes: number;
  limiteMensalAtingido: number;
}

export function useReports(period: string = "3") {
  const { purchases, user } = useApp();

  const reportData = useMemo<ReportData>(() => {
    const months = parseInt(period);
    const now = new Date();
    const chartData: ChartDataItem[] = [];

    // Dados para o gráfico de evolução
    for (let i = months - 1; i >= 0; i--) {
      const currentMonth = subMonths(now, i);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      // Filtra compras do mês
      const monthPurchases = purchases.filter((p) => {
        const purchaseDate = new Date(p.date);
        return purchaseDate >= start && purchaseDate <= end;
      });

      // Calcula totais
      const total = monthPurchases.reduce((acc, p) => acc + p.amount, 0);

      // Agrupa por categoria
      const categories = monthPurchases.reduce<CategoryTotal>((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + p.amount;
        return acc;
      }, {});

      chartData.push({
        month: format(currentMonth, "MMM", { locale: ptBR }),
        total,
        categories,
      });
    }

    // Dados por categoria
    const categoryTotals = purchases.reduce<CategoryTotal>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.amount;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total);

    // Análise de tendências
    const tendencias: TrendAnalysis[] = categoryData.map(
      ({ category, total }) => {
        const thisMonth = purchases
          .filter(
            (p) => isSameMonth(new Date(p.date), now) && p.category === category
          )
          .reduce((acc, p) => acc + p.amount, 0);

        const lastMonth = purchases
          .filter(
            (p) =>
              isSameMonth(new Date(p.date), subMonths(now, 1)) &&
              p.category === category
          )
          .reduce((acc, p) => acc + p.amount, 0);

        const variacao = lastMonth
          ? ((thisMonth - lastMonth) / lastMonth) * 100
          : 0;
        const percentual =
          (total / purchases.reduce((acc, p) => acc + p.amount, 0)) * 100;

        return {
          category,
          total,
          percentual,
          variacao,
          status: variacao > 5 ? "up" : variacao < -5 ? "down" : "stable",
        };
      }
    );

    // Análise por dia da semana
    const diasMaisGastos = Array.from({ length: 7 })
      .map((_, index) => {
        const comprasDoDia = purchases.filter(
          (p) => new Date(p.date).getDay() === index
        );
        const total = comprasDoDia.reduce((acc, p) => acc + p.amount, 0);
        return {
          dayOfWeek: format(new Date(2024, 0, index + 1), "EEEE", {
            locale: ptBR,
          }),
          total,
          count: comprasDoDia.length,
          average: comprasDoDia.length ? total / comprasDoDia.length : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    // Análise por loja
    const lojasMaisFrequentes = Object.entries(
      purchases.reduce<
        Record<string, { total: number; count: number; dates: Date[] }>
      >((acc, p) => {
        if (!acc[p.store?.name || "Outros"]) {
          acc[p.store?.name || "Outros"] = { total: 0, count: 0, dates: [] };
        }
        acc[p.store?.name || "Outros"].total += p.amount;
        acc[p.store?.name || "Outros"].count += 1;
        acc[p.store?.name || "Outros"].dates.push(new Date(p.date));
        return acc;
      }, {})
    )
      .map(([store, data]) => ({
        store,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
        lastPurchase: new Date(Math.max(...data.dates.map((d) => d.getTime()))),
      }))
      .sort((a, b) => b.total - a.total);

    // Cálculos adicionais
    const totalGasto = purchases.reduce((acc, p) => acc + p.amount, 0);
    const mediaGastoMensal = totalGasto / months;
    const categoriasMaisGastos = categoryData.slice(0, 5); // Top 5 categorias
    const maiorGastoUnico = purchases.reduce(
      (max, p) => (p.amount > (max?.amount || 0) ? p : max),
      purchases[0]
    );

    // Métricas importantes
    const comprasRecentes = purchases.filter((p) =>
      isWithinInterval(new Date(p.date), {
        start: startOfMonth(subMonths(now, months - 1)),
        end: now,
      })
    );

    const gastosPorMes = chartData.map((m) => ({
      mes: m.month,
      valor: m.total,
    }));
    const maiorMes = gastosPorMes.reduce(
      (max, m) => (m.valor > max.valor ? m : max),
      gastosPorMes[0]
    );
    const menorMes = gastosPorMes.reduce(
      (min, m) => (m.valor < min.valor ? m : min),
      gastosPorMes[0]
    );

    const comprasParceladas = comprasRecentes.filter(
      (p) => p.installments && p.installments > 1
    );
    const totalParcelado = comprasParceladas.reduce(
      (acc, p) => acc + p.amount,
      0
    );

    const metricasImportantes = {
      totalCompras: comprasRecentes.length,
      ticketMedio:
        comprasRecentes.reduce((acc, p) => acc + p.amount, 0) /
        comprasRecentes.length,
      maiorMes,
      menorMes,
      gastosPendentes: comprasRecentes
        .filter((p) => p.status === "pending")
        .reduce((acc, p) => acc + p.remainingAmount, 0),
      totalParcelado,
      percentualParcelado: (totalParcelado / totalGasto) * 100,
      categoriaEmAlta:
        tendencias.find((t) => t.status === "up")?.category || "-",
      categoriaEmBaixa:
        tendencias.find((t) => t.status === "down")?.category || "-",
    };

    // Previsão para o próximo mês (média ponderada dos últimos meses)
    const pesos = [0.5, 0.3, 0.2]; // Maior peso para meses mais recentes
    const previsaoProximoMes = chartData
      .slice(-3)
      .reduce((acc, mes, i) => acc + mes.total * pesos[i], 0);

    // Percentual do limite mensal atingido
    const limiteAtingido = user?.monthlyLimit
      ? (chartData[chartData.length - 1]?.total / user.monthlyLimit) * 100
      : 0;

    return {
      chartData,
      categoryData,
      totalGasto,
      mediaGastoMensal,
      categoriasMaisGastos,
      maiorGastoUnico,
      tendencias,
      diasMaisGastos,
      lojasMaisFrequentes,
      metricasImportantes,
      previsaoProximoMes,
      limiteMensalAtingido: limiteAtingido,
    };
  }, [purchases, period, user?.monthlyLimit]);

  return reportData;
}
