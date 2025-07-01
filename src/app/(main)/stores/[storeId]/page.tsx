'use client';

import { useParams } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Store as StoreIcon, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';
import { AddPurchaseForm } from '@/app/components/forms/AddPurchaseForm';
import { PaymentForm } from '@/app/components/forms/PaymentForm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function StorePage() {
  const { storeId } = useParams();
  const { state } = useApp();
  const { stores, purchases } = state;

  const store = stores.find(s => s.id === storeId);
  if (!store) return <div>Loja não encontrada</div>;

  const storePurchases = purchases
    .filter(p => p.storeId === storeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalAmount = storePurchases.reduce((total, p) => total + p.amount, 0);
  const paidAmount = storePurchases
    .filter(p => p.status === 'paid')
    .reduce((total, p) => total + p.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Loja */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={store.logo} alt={store.name} />
            <AvatarFallback>
              <StoreIcon className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{store.name}</h1>
            <p className="text-lg text-muted-foreground">{store.category}</p>
          </div>
        </div>
        <AddPurchaseForm storeId={store.id} />
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Compras</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {storePurchases.length} compras registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {paidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {storePurchases.filter(p => p.status === 'paid').length} compras pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {storePurchases.filter(p => p.status !== 'paid').length} compras pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Compras */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>
            Todas as compras realizadas nesta loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {storePurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between space-x-4 rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {purchase.description || `Compra #${purchase.id.slice(-4)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(purchase.date), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                    <Badge variant={purchase.status === 'paid' ? 'default' : 'secondary'}>
                      {purchase.status === 'paid' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        R$ {purchase.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.category}
                      </p>
                    </div>
                    {purchase.status !== 'paid' && (
                      <PaymentForm
                        purchase={purchase}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 