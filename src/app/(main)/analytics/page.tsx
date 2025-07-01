'use client';

import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2'];

interface PieLabel {
  name: string;
  percent: number;
}

export default function AnalyticsPage() {
  const { purchases, stores } = useApp();
  const [timeRange, setTimeRange] = useState('30');

  // Preparar dados para os gráficos
  const now = new Date();
  const daysAgo = new Date(now.setDate(now.getDate() - parseInt(timeRange)));

  // Dados para o gráfico de gastos diários
  const dailySpending = purchases
    .filter(p => new Date(p.date) >= daysAgo)
    .reduce((acc, purchase) => {
      const date = new Date(purchase.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + purchase.amount;
      return acc;
    }, {} as Record<string, number>);

  const dailyData = Object.entries(dailySpending).map(([date, amount]) => ({
    date,
    amount,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Dados para o gráfico de gastos por categoria
  const categorySpending = purchases.reduce((acc, purchase) => {
    acc[purchase.category] = (acc[purchase.category] || 0) + purchase.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categorySpending).map(([name, value]) => ({
    name,
    value,
  }));

  // Dados para o gráfico de gastos por loja
  const storeSpending = purchases.reduce((acc, purchase) => {
    const store = stores.find(s => s.id === purchase.storeId);
    if (store) {
      acc[store.name] = (acc[store.name] || 0) + purchase.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const storeData = Object.entries(storeSpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Análise de Gastos</h1>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Linha - Gastos Diários */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Evolução dos Gastos</CardTitle>
            <CardDescription>
              Acompanhamento diário dos seus gastos
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  name="Valor Gasto"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Gastos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>
              Distribuição dos gastos entre categorias
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label={({ name, percent }) =>
                    percent ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                  }
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Top 5 Lojas */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Lojas</CardTitle>
            <CardDescription>
              Estabelecimentos onde você mais gastou
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Valor Gasto"
                  fill="#2563eb"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 