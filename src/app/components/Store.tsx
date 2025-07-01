'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoreDetails } from './StoreDetails';

interface StoreProps {
  id: string;
}

export function Store({ id }: StoreProps) {
  const { stores, purchases } = useApp();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const store = stores.find(s => s.id === id);
  if (!store) return null;

  const storePurchases = purchases.filter(p => p.storeId === id);
  const totalSpent = storePurchases.reduce((total, p) => total + p.amount, 0);
  const pendingAmount = storePurchases
    .filter(p => p.status !== 'paid')
    .reduce((total, p) => total + p.remainingAmount, 0);

  return (
    <>
      <Card
        className="hover:bg-accent/50 cursor-pointer transition-colors"
        onClick={() => setIsDetailsOpen(true)}
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
              setIsDetailsOpen(true);
            }}>
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>

      <StoreDetails
        storeId={id}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
} 