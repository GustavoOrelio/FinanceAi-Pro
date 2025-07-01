'use client';

import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Store, ArrowUpCircle, ArrowDownCircle, Target, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, purchases, stores, monthlyLimit } = useApp();

  // Cálculos financeiros
  const currentMonth = new Date().getMonth();
  const currentMonthPurchases = purchases.filter(
    (p) => new Date(p.date).getMonth() === currentMonth
  );

  const totalSpentThisMonth = currentMonthPurchases.reduce(
    (total, p) => total + p.amount,
    0
  );

  const remainingBudget = monthlyLimit - totalSpentThisMonth;
  const spentPercentage = monthlyLimit > 0 ? (totalSpentThisMonth / monthlyLimit) * 100 : 0;

  // Calcula o total economizado (diferença entre limite e gastos)
  const totalSaved = purchases.reduce((total, purchase) => {
    const purchaseMonth = new Date(purchase.date).getMonth();
    const monthLimit = monthlyLimit || 0;
    const monthSpent = purchases
      .filter(p => new Date(p.date).getMonth() === purchaseMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    return total + Math.max(0, monthLimit - monthSpent);
  }, 0);

  // Top 5 lojas mais visitadas
  const storeVisits = purchases.reduce((acc, purchase) => {
    if (purchase.storeId) {
      acc[purchase.storeId] = (acc[purchase.storeId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topStores = stores
    .map(store => ({
      ...store,
      visits: storeVisits[store.id] || 0,
      totalSpent: purchases
        .filter(p => p.storeId === store.id)
        .reduce((total, p) => total + p.amount, 0)
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name || 'Usuário'}
          </p>
        </div>
        <Button asChild>
          <Link href="/stores">
            <Store className="mr-2 h-4 w-4" />
            Gerenciar Lojas
          </Link>
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Mensal</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalSpentThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonthPurchases.length} compras este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Restante</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(remainingBudget)}
            </div>
            <Progress value={spentPercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite Mensal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(monthlyLimit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Meta definida
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Economizado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalSaved)}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde o início
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Lojas Mais Visitadas */}
      <Card>
        <CardHeader>
          <CardTitle>Lojas Mais Visitadas</CardTitle>
          <CardDescription>
            Top 5 estabelecimentos com mais compras registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {topStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between space-x-4 rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={store.logo} alt={store.name} />
                      <AvatarFallback>{store.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{store.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {store.visits} visitas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(store.totalSpent)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total gasto
                    </p>
                  </div>
                </div>
              ))}

              {topStores.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma loja registrada ainda</p>
                  <p className="text-sm">
                    Comece a registrar suas compras para ver estatísticas
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 