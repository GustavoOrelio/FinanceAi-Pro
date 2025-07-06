'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Plus, Target, Trash2, Wallet, TrendingUp, ShoppingBag, CreditCard, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Goal } from '@/lib/types';

const CATEGORIES = [
  { value: 'savings', label: 'Poupança', icon: Wallet },
  { value: 'investment', label: 'Investimento', icon: TrendingUp },
  { value: 'purchase', label: 'Compra', icon: ShoppingBag },
  { value: 'debt', label: 'Dívida', icon: CreditCard },
  { value: 'other', label: 'Outro', icon: Target },
] as const;

const PRIORITIES = [
  { value: 'low', label: 'Baixa', color: 'text-yellow-500' },
  { value: 'medium', label: 'Média', color: 'text-orange-500' },
  { value: 'high', label: 'Alta', color: 'text-red-500' },
] as const;

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal, user } = useApp();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: undefined,
    category: 'other',
    status: 'active',
  });
  const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'priority'>('deadline');
  const [filterCategory, setFilterCategory] = useState<Goal['category'] | 'all'>('all');

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!user?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    try {
      await addGoal({
        userId: user.id,
        title: newGoal.title,
        description: newGoal.description || '',
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount) || 0,
        deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
        category: newGoal.category || 'other',
        status: newGoal.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setNewGoal({
        title: '',
        description: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: undefined,
        category: 'other',
        status: 'active',
      });
      setIsAddingGoal(false);
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await removeGoal(id);
    } catch (error) {
      console.error('Erro ao remover meta:', error);
    }
  };

  const handleUpdateProgress = async (id: string, newAmount: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      const updatedAmount = Math.min(newAmount, goal.targetAmount);
      await updateGoal(id, { currentAmount: updatedAmount });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const calculateRemainingDays = (deadline: Date | undefined) => {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedAndFilteredGoals = useMemo(() => {
    let filtered = filterCategory === 'all'
      ? goals
      : goals.filter(goal => goal.category === filterCategory);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'progress':
          return (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount);
        case 'priority':
          // Como não temos priority no tipo Goal, vamos usar status como fallback
          const statusOrder = { active: 0, completed: 1, paused: 2 };
          return (statusOrder[a.status as keyof typeof statusOrder] || 0) - (statusOrder[b.status as keyof typeof statusOrder] || 0);
        default:
          return 0;
      }
    });
  }, [goals, sortBy, filterCategory]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metas Financeiras</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe suas metas financeiras
          </p>
        </div>
        <Button onClick={() => setIsAddingGoal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Select
          value={filterCategory}
          onValueChange={(value: typeof filterCategory) => setFilterCategory(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {category.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value: typeof sortBy) => setSortBy(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Data limite</SelectItem>
            <SelectItem value="progress">Progresso</SelectItem>
            <SelectItem value="priority">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isAddingGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Meta</CardTitle>
            <CardDescription>
              Defina os detalhes da sua nova meta financeira
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Fundo de Emergência"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva sua meta..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Total</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor Atual (opcional)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: Number(e.target.value) }))}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={newGoal.category}
                onValueChange={(value: Goal['category']) =>
                  setNewGoal(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Data Limite</Label>
              <Input
                id="deadline"
                type="date"
                value={newGoal.deadline ? new Date(newGoal.deadline).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value ? new Date(e.target.value) : undefined }))}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddGoal}>
                Adicionar Meta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {sortedAndFilteredGoals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    {goal.title}
                    <Badge variant="outline" className={
                      goal.status === 'active' ? 'text-green-500' :
                        goal.status === 'completed' ? 'text-blue-500' : 'text-yellow-500'
                    }>
                      {goal.status === 'active' ? 'Ativa' :
                        goal.status === 'completed' ? 'Concluída' : 'Pausada'}
                    </Badge>
                  </CardTitle>
                  <Badge variant="secondary">
                    {CATEGORIES.find(c => c.value === goal.category)?.label}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{goal.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                </span>
                <span>{calculateProgress(goal.currentAmount, goal.targetAmount)}%</span>
              </div>
              <Progress value={calculateProgress(goal.currentAmount, goal.targetAmount)} />

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {goal.deadline ? `${calculateRemainingDays(goal.deadline)} dias restantes` : 'Sem data limite'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newAmount = prompt(
                      'Digite o novo valor atual:',
                      goal.currentAmount.toString()
                    );
                    if (newAmount && !isNaN(Number(newAmount))) {
                      handleUpdateProgress(goal.id, Number(newAmount));
                    }
                  }}
                >
                  Atualizar Progresso
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 