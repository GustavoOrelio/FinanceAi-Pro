'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Purchase } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  purchaseId: string;
  onSuccess?: () => void;
}

export function PaymentForm({ purchaseId, onSuccess }: PaymentFormProps) {
  const { purchases, updatePurchase } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<Purchase['paymentMethod']>('credit');
  const [installments, setInstallments] = useState('1');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isFullPayment, setIsFullPayment] = useState(true);

  const purchase = purchases.find(p => p.id === purchaseId);

  if (!purchase) return null;

  const remainingAmount = purchase.amount - (purchase.paidAmount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchase || !paymentMethod) return;

    const amount = isFullPayment ? remainingAmount : parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > remainingAmount) return;

    const newPayment = {
      id: Date.now().toString(),
      purchaseId: purchase.id,
      amount,
      date: new Date().toISOString(),
      method: paymentMethod,
      installments: paymentMethod === 'credit' ? parseInt(installments) : undefined,
    };

    const newPaidAmount = (purchase.paidAmount || 0) + amount;
    const newRemainingAmount = purchase.amount - newPaidAmount;
    const newStatus = newRemainingAmount === 0 ? 'paid' : 'partially_paid';

    updatePurchase(purchase.id, {
      ...purchase,
      status: newStatus as Purchase['status'],
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      payments: [...(purchase.payments || []), newPayment],
      paidAt: newStatus === 'paid' ? new Date().toISOString() : undefined,
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Valor Total da Compra</Label>
        <Input
          value={`R$ ${purchase.amount.toFixed(2)}`}
          disabled
        />
      </div>

      {purchase.paidAmount > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Valor Já Pago</Label>
            <Input
              value={`R$ ${purchase.paidAmount.toFixed(2)}`}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>Valor Restante</Label>
            <Input
              value={`R$ ${remainingAmount.toFixed(2)}`}
              disabled
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant={isFullPayment ? "default" : "outline"}
          onClick={() => setIsFullPayment(true)}
          className="flex-1"
        >
          Pagamento Total
        </Button>
        <Button
          type="button"
          variant={!isFullPayment ? "default" : "outline"}
          onClick={() => setIsFullPayment(false)}
          className="flex-1"
        >
          Pagamento Parcial
        </Button>
      </div>

      {!isFullPayment && (
        <div className="space-y-2">
          <Label htmlFor="paymentAmount">Valor do Pagamento</Label>
          <Input
            id="paymentAmount"
            type="number"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder={`Máximo: R$ ${remainingAmount.toFixed(2)}`}
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
        <Select
          value={paymentMethod || undefined}
          onValueChange={(value) => setPaymentMethod(value as Purchase['paymentMethod'])}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a forma de pagamento" />
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
        <div className="space-y-2">
          <Label htmlFor="installments">Parcelas</Label>
          <Select value={installments} onValueChange={setInstallments}>
            <SelectTrigger>
              <SelectValue placeholder="Número de parcelas" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num}x {num === 1 ? 'à vista' : `de R$ ${((isFullPayment ? remainingAmount : parseFloat(paymentAmount) || 0) / num).toFixed(2)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!isFullPayment && (!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingAmount)}
      >
        {isFullPayment ? 'Pagar Total' : 'Pagar Parcialmente'}
      </Button>
    </form>
  );
} 