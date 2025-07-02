'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StoreProps {
  id: string;
}

export function Store({ id }: StoreProps) {
  const router = useRouter();
  const { stores, purchases } = useApp();

  const store = stores.find(s => s.id === id);
  if (!store) return null;

  const storePurchases = purchases.filter(p => p.storeId === id);
  const totalSpent = storePurchases.reduce((total, p) => total + p.amount, 0);
  const pendingAmount = storePurchases
    .filter(p => p.status !== 'paid')
    .reduce((total, p) => total + p.remainingAmount, 0);

  const handleStoreClick = () => {
    router.push(`/stores/${id}`);
  };

  return (
    <Card
      className="hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={handleStoreClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{store.name}</span>
          {pendingAmount > 0 && (
            <span className="text-sm font-normal text-red-500">
              Pendente: R$ {pendingAmount.toFixed(2)}
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{store.category}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Gasto</p>
            <p className="text-lg font-semibold">R$ {totalSpent.toFixed(2)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={(e) => {
            e.stopPropagation();
            router.push(`/stores/${id}`);
          }}>
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 