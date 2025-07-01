'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, BellOff, Check, Clock, DollarSign, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'goal' | 'alert' | 'achievement';
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: {
    goalId?: string;
    purchaseId?: string;
    amount?: number;
    category?: string;
  };
}

interface NotificationSettings {
  paymentReminders: boolean;
  goalAlerts: boolean;
  budgetAlerts: boolean;
  achievementAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyOnMobileOnly: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

// Dados simulados
const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Fatura Próxima',
    message: 'A fatura do cartão vence em 3 dias. Valor: R$ 1.500,00',
    type: 'payment',
    date: '2024-03-15T10:00:00',
    read: false,
    priority: 'high',
    metadata: {
      amount: 1500,
      category: 'credit_card',
    },
  },
  {
    id: '2',
    title: 'Meta Atingida',
    message: 'Parabéns! Você atingiu 50% da sua meta "Fundo de Emergência"',
    type: 'goal',
    date: '2024-03-14T15:30:00',
    read: true,
    priority: 'medium',
    actionUrl: '/goals',
    metadata: {
      goalId: '1',
    },
  },
  {
    id: '3',
    title: 'Alerta de Orçamento',
    message: 'Você ultrapassou 80% do limite mensal na categoria "Alimentação"',
    type: 'alert',
    date: '2024-03-13T09:15:00',
    read: false,
    priority: 'high',
    actionUrl: '/analytics',
    metadata: {
      category: 'food',
      amount: 800,
    },
  },
  {
    id: '4',
    title: 'Nova Conquista!',
    message: 'Você desbloqueou a conquista "Poupador Iniciante"',
    type: 'achievement',
    date: '2024-03-12T14:20:00',
    read: false,
    priority: 'low',
    metadata: {},
  },
];

const initialSettings: NotificationSettings = {
  paymentReminders: true,
  goalAlerts: true,
  budgetAlerts: true,
  achievementAlerts: true,
  emailNotifications: true,
  pushNotifications: false,
  notifyOnMobileOnly: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export default function NotificationsPage() {
  const { user, goals } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Simula a verificação de permissão de notificações do navegador
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setIsSubscribed(permission === 'granted');
      });
    }
  }, []);

  // Simula a inscrição em notificações push
  const subscribeToNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY',
        });

        // Aqui você enviaria a subscription para seu backend
        console.log('Push Notification Subscription:', subscription);
        setIsSubscribed(true);
        toast.success('Notificações push ativadas com sucesso!');
      } catch (error) {
        console.error('Erro ao se inscrever nas notificações:', error);
        toast.error('Erro ao ativar notificações push');
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    toast.success('Notificação marcada como lida');
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success('Todas as notificações marcadas como lidas');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
    toast.success('Notificação removida');
  };

  const toggleSetting = (key: keyof NotificationSettings, value?: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value ?? !prev[key],
    }));
    toast.success(`Configuração atualizada`);

    // Se estiver ativando notificações push
    if (key === 'pushNotifications' && value === true && !isSubscribed) {
      subscribeToNotifications();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-5 w-5" />;
      case 'goal':
        return <Target className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      case 'achievement':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-yellow-500';
      default:
        return '';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie suas notificações e preferências
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notificações Recentes</CardTitle>
            <CardDescription>
              {unreadCount} notificações não lidas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <BellOff className="h-12 w-12 mb-4" />
                <p>Nenhuma notificação no momento</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${notification.read ? 'bg-muted/50' : 'bg-muted'
                    }`}
                >
                  <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">
                          Nova
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={getPriorityColor(notification.priority)}
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(notification.date)}
                      </div>
                      {notification.actionUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          asChild
                        >
                          <Link href={notification.actionUrl}>
                            Ver detalhes
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <BellOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Notificação</CardTitle>
              <CardDescription>
                Escolha quais tipos de notificação deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-reminders">Lembretes de Pagamento</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas sobre faturas e pagamentos próximos
                  </p>
                </div>
                <Switch
                  id="payment-reminders"
                  checked={settings.paymentReminders}
                  onCheckedChange={(checked) => toggleSetting('paymentReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="goal-alerts">Alertas de Metas</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado sobre o progresso das suas metas
                  </p>
                </div>
                <Switch
                  id="goal-alerts"
                  checked={settings.goalAlerts}
                  onCheckedChange={(checked) => toggleSetting('goalAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="budget-alerts">Alertas de Orçamento</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas quando estiver próximo dos limites
                  </p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={settings.budgetAlerts}
                  onCheckedChange={(checked) => toggleSetting('budgetAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="achievement-alerts">Alertas de Conquistas</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado quando desbloquear novas conquistas
                  </p>
                </div>
                <Switch
                  id="achievement-alerts"
                  checked={settings.achievementAlerts}
                  onCheckedChange={(checked) => toggleSetting('achievementAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canais de Notificação</CardTitle>
              <CardDescription>
                Configure como deseja receber as notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações no seu email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => toggleSetting('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações no navegador
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => toggleSetting('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mobile-only">Apenas no Celular</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações apenas no dispositivo móvel
                  </p>
                </div>
                <Switch
                  id="mobile-only"
                  checked={settings.notifyOnMobileOnly}
                  onCheckedChange={(checked) => toggleSetting('notifyOnMobileOnly', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Horário Silencioso</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Defina um período para não receber notificações
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Início</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => toggleSetting('quietHoursStart', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">Fim</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => toggleSetting('quietHoursEnd', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 