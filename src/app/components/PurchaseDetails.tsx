'use client';

import { Purchase } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface PurchaseDetailsProps {
  purchase: Purchase;
}

const STATUS_MAP = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  partially_paid: { label: 'Parcialmente Pago', color: 'bg-blue-500' },
  paid: { label: 'Pago', color: 'bg-green-500' }
};

const PAYMENT_METHOD_MAP = {
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  pix: 'PIX',
  money: 'Dinheiro'
};

export function PurchaseDetails({ purchase }: PurchaseDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Detalhes da Compra</h3>
        <Badge className={STATUS_MAP[purchase.status].color}>
          {STATUS_MAP[purchase.status].label}
        </Badge>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-lg font-semibold">R$ {purchase.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data da Compra</p>
            <p className="text-lg">{formatDate(purchase.date)}</p>
          </div>
          {purchase.paidAmount > 0 && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Valor Pago</p>
                <p className="text-lg font-semibold text-green-600">
                  R$ {purchase.paidAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Restante</p>
                <p className="text-lg font-semibold text-blue-600">
                  R$ {purchase.remainingAmount.toFixed(2)}
                </p>
              </div>
            </>
          )}
        </div>

        {purchase.description && (
          <div>
            <p className="text-sm text-muted-foreground">Descrição</p>
            <p>{purchase.description}</p>
          </div>
        )}

        {purchase.payments && purchase.payments.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Histórico de Pagamentos</p>
            <div className="space-y-2">
              {purchase.payments.map((payment, index) => (
                <Card key={payment.id} className="p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor</p>
                      <p className="font-medium">R$ {payment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data</p>
                      <p>{formatDate(payment.date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Método</p>
                      <p>{PAYMENT_METHOD_MAP[payment.method]}</p>
                    </div>
                    {payment.installments && (
                      <div>
                        <p className="text-muted-foreground">Parcelas</p>
                        <p>{payment.installments}x</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 