'use client';

import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { monthlyLimit, setMonthlyLimit } = useData();

  const handleMonthlyLimitChange = (value: string) => {
    const limit = parseFloat(value);
    if (!isNaN(limit) && limit >= 0) {
      setMonthlyLimit(limit);
      toast.success('Limite mensal atualizado');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize suas preferências e limites
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Limite Mensal</CardTitle>
            <CardDescription>
              Defina um limite mensal para seus gastos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="monthlyLimit">Limite (R$)</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyLimit}
                  onChange={(e) => handleMonthlyLimitChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 