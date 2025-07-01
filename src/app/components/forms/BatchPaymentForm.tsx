'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Payment } from '@/lib/types';

interface BatchPaymentFormProps {
  storeId: string;
  onSuccess: () => void;
}

export function BatchPaymentForm({ storeId, onSuccess }: BatchPaymentFormProps) {
  const { purchases, updatePurchase } = useApp();
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('credit');
  const [installments, setInstallments] = useState<number>(1);

  const storePurchases = purchases.filter(
    (p) => p.storeId === storeId && p.status !== 'paid'
  );

  const totalAmount = selectedPurchases
    .map((id) => purchases.find((p) => p.id === id)?.remainingAmount || 0)
    .reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    selectedPurchases.forEach((purchaseId) => {
      const purchase = purchases.find((p) => p.id === purchaseId);
      if (!purchase) return;

      const payment: Payment = {
        id: uuidv4(),
        purchaseId,
        amount: purchase.remainingAmount,
        method: paymentMethod,
        installments: paymentMethod === 'credit' ? installments : undefined,
        date: new Date().toISOString(),
      };

      const updatedPurchase = {
        ...purchase,
        payments: [...purchase.payments, payment],
        remainingAmount: 0,
        status: 'paid' as const,
      };

      updatePurchase(purchaseId, updatedPurchase);
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {storePurchases.map((purchase) => (
          <Card key={purchase.id} className="p-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={selectedPurchases.includes(purchase.id)}
                onCheckedChange={(checked: boolean) => {
                  setSelectedPurchases((prev) =>
                    checked
                      ? [...prev, purchase.id]
                      : prev.filter((id) => id !== purchase.id)
                  );
                }}
              />
              <div className="flex-1">
                <p className="font-medium">{purchase.description}</p>
                <p className="text-sm text-muted-foreground">
                  R$ {purchase.remainingAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <Label>Método de Pagamento</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value: Payment['method']) => setPaymentMethod(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit">Cartão de Crédito</SelectItem>
              <SelectItem value="debit">Cartão de Débito</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="money">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === 'credit' && (
          <div>
            <Label>Parcelas</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
            />
          </div>
        )}

        <div>
          <Label>Total a Pagar</Label>
          <p className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</p>
        </div>

        <Button
          type="submit"
          disabled={selectedPurchases.length === 0 || !paymentMethod}
          className="w-full"
        >
          Pagar Selecionadas
        </Button>
      </div>
    </form>
  );
}
