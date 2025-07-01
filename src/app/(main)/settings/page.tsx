'use client';

import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, monthlyLimit, setMonthlyLimit } = useApp();

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
        {/* Configurações de Tema */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Personalize a aparência do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="theme-toggle">Modo Escuro</Label>
                <span className="text-sm text-muted-foreground">
                  Alterne entre os temas claro e escuro
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  id="theme-toggle"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle>Limites Financeiros</CardTitle>
            <CardDescription>
              Configure seus limites de gastos mensais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-limit">Limite Mensal</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="monthly-limit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={monthlyLimit}
                    onChange={(e) => handleMonthlyLimitChange(e.target.value)}
                    placeholder="0.00"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleMonthlyLimitChange('0')}
                  >
                    Limpar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Defina um limite para seus gastos mensais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Gerencie suas preferências de notificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="alerts">Alertas de Limite</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas quando estiver próximo do seu limite mensal
                  </p>
                </div>
                <Switch
                  id="alerts"
                  defaultChecked
                  onCheckedChange={(checked) => {
                    toast.success(
                      `Alertas de limite ${checked ? 'ativados' : 'desativados'}`
                    );
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reports">Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo semanal dos seus gastos
                  </p>
                </div>
                <Switch
                  id="reports"
                  defaultChecked
                  onCheckedChange={(checked) => {
                    toast.success(
                      `Relatórios semanais ${checked ? 'ativados' : 'desativados'}`
                    );
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 