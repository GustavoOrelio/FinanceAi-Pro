'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddPurchaseForm } from './forms/AddPurchaseForm';
import { BatchPaymentForm } from './forms/BatchPaymentForm';
import { PurchaseList } from './PurchaseList';
import { PurchaseDetails } from './PurchaseDetails';
import { PaymentForm } from './forms/PaymentForm';

interface StoreDetailsProps {
  storeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StoreDetails({ storeId, isOpen, onClose }: StoreDetailsProps) {
  const { stores, purchases } = useApp();
  const [selectedPurchase, setSelectedPurchase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'historico' | 'nova-compra' | 'pagar-todas'>('historico');

  const store = stores.find(s => s.id === storeId);
  const storePurchases = purchases.filter(p => p.storeId === storeId);

  const totalSpent = storePurchases.reduce((total, p) => total + p.amount, 0);
  const pendingAmount = storePurchases
    .filter(p => p.status !== 'paid')
    .reduce((total, p) => total + p.remainingAmount, 0);
  const averageAmount = storePurchases.length > 0 ? totalSpent / storePurchases.length : 0;

  if (!store) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{store.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{store.category}</p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Total Gasto</p>
            <p className="text-2xl font-bold">R$ {totalSpent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Valor total em compras</p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">A Pagar</p>
            <p className="text-2xl font-bold">R$ {pendingAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Compras pendentes</p>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <p className="text-sm text-muted-foreground">Média</p>
            <p className="text-2xl font-bold">R$ {averageAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Valor médio</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as typeof activeTab);
          setSelectedPurchase(null);
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="nova-compra">Nova Compra</TabsTrigger>
            <TabsTrigger value="pagar-todas">Pagar Todas</TabsTrigger>
          </TabsList>

          <TabsContent value="historico" className="mt-4">
            <PurchaseList
              purchases={storePurchases}
              onSelectPurchase={(purchase) => setSelectedPurchase(purchase.id)}
            />
          </TabsContent>

          <TabsContent value="nova-compra" className="mt-4">
            <AddPurchaseForm
              storeId={storeId}
              onSuccess={() => {
                setActiveTab('historico');
              }}
            />
          </TabsContent>

          <TabsContent value="pagar-todas" className="mt-4">
            <BatchPaymentForm
              storeId={storeId}
              onSuccess={() => {
                setActiveTab('historico');
              }}
            />
          </TabsContent>
        </Tabs>

        {selectedPurchase && (
          <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalhes da Compra</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <PurchaseDetails
                  purchase={purchases.find(p => p.id === selectedPurchase)!}
                />
                {purchases.find(p => p.id === selectedPurchase)?.status !== 'paid' && (
                  <PaymentForm
                    purchaseId={selectedPurchase}
                    onSuccess={() => setSelectedPurchase(null)}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
} 