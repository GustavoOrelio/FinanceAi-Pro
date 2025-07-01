'use client';

import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddPurchaseForm } from '@/app/components/forms/AddPurchaseForm';
import { PaymentForm } from '@/app/components/forms/PaymentForm';
import { Plus, CreditCard } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function StorePage() {
  const { storeId } = useParams();
  const { stores, purchases } = useApp();

  const store = stores.find(s => s.id === storeId);
  const storePurchases = purchases.filter(p => p.storeId === storeId);

  if (!store) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Loja não encontrada</CardTitle>
            <CardDescription>A loja que você está procurando não existe.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Cálculos de estatísticas
  const totalSpent = storePurchases.reduce((total, p) => total + p.amount, 0);
  const unpaidPurchases = storePurchases.filter(p => p.status === 'pending');
  const totalUnpaid = unpaidPurchases.reduce((total, p) => total + p.amount, 0);
  const averageSpent = storePurchases.length > 0 ? totalSpent / storePurchases.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{store.name}</h1>
          <p className="text-muted-foreground">{store.category}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Compra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Compra</DialogTitle>
            </DialogHeader>
            <AddPurchaseForm storeId={store.id} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Gasto</CardTitle>
            <CardDescription>Valor total em compras</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>A Pagar</CardTitle>
            <CardDescription>Compras pendentes de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {totalUnpaid.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Média por Compra</CardTitle>
            <CardDescription>Valor médio das compras</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {averageSpent.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>Todas as compras realizadas nesta loja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storePurchases.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nenhuma compra registrada ainda.
              </p>
            ) : (
              storePurchases.map(purchase => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{purchase.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(purchase.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">R$ {purchase.amount.toFixed(2)}</p>
                    {purchase.status === 'pending' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pagar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Realizar Pagamento</DialogTitle>
                          </DialogHeader>
                          <PaymentForm purchaseId={purchase.id} />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 