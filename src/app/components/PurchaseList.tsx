'use client';

import { Purchase } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface PurchaseListProps {
  purchases: Purchase[];
  onSelectPurchase: (purchase: Purchase) => void;
}

const STATUS_MAP = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  partially_paid: { label: 'Parcialmente Pago', color: 'bg-blue-500' },
  paid: { label: 'Pago', color: 'bg-green-500' }
};

export function PurchaseList({ purchases, onSelectPurchase }: PurchaseListProps) {
  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <Card
          key={purchase.id}
          className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => onSelectPurchase(purchase)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge className={STATUS_MAP[purchase.status].color}>
                {STATUS_MAP[purchase.status].label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(purchase.date)}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              onSelectPurchase(purchase);
            }}>
              Ver Detalhes
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="font-semibold">R$ {purchase.amount.toFixed(2)}</p>
            </div>
            {purchase.paidAmount > 0 && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Pago</p>
                  <p className="font-semibold text-green-600">
                    R$ {purchase.paidAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Restante</p>
                  <p className="font-semibold text-blue-600">
                    R$ {purchase.remainingAmount.toFixed(2)}
                  </p>
                </div>
              </>
            )}
          </div>

          {purchase.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
              {purchase.description}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
} 