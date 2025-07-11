'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Goal } from '@/lib/types';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData();
  const { user } = useAuth();
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
      await deleteGoal(id);
    } catch (error) {
      console.error('Erro ao remover meta:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Metas</h1>
          <p className="text-muted-foreground">
            Gerencie suas metas financeiras
          </p>
        </div>
        <Button onClick={() => setIsAddingGoal(true)}>
          Nova Meta
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label>Ordenar por</Label>
          <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline">Data Limite</SelectItem>
              <SelectItem value="progress">Progresso</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Filtrar por Categoria</Label>
          <Select value={filterCategory} onValueChange={(value: typeof filterCategory) => setFilterCategory(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="savings">Poupança</SelectItem>
              <SelectItem value="investment">Investimento</SelectItem>
              <SelectItem value="debt">Dívida</SelectItem>
              <SelectItem value="purchase">Compra</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhuma meta cadastrada
            </CardContent>
          </Card>
        ) : (
          goals
            .filter(goal => filterCategory === 'all' || goal.category === filterCategory)
            .sort((a, b) => {
              switch (sortBy) {
                case 'deadline':
                  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                case 'progress':
                  return (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount);
                case 'priority':
                  return a.category === 'debt' ? -1 : 1;
                default:
                  return 0;
              }
            })
            .map(goal => (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription>
                    {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Progresso</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold">
                          {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(goal.currentAmount)} / {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(goal.targetAmount)}
                        </p>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Data Limite</p>
                      <p>{new Date(goal.deadline).toLocaleDateString()}</p>
                    </div>

                    {goal.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Descrição</p>
                        <p>{goal.description}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const newAmount = prompt('Digite o novo valor atual:');
                          if (newAmount) {
                            const amount = parseFloat(newAmount);
                            if (!isNaN(amount)) {
                              updateGoal({
                                ...goal,
                                currentAmount: amount,
                                updatedAt: new Date(),
                              });
                            }
                          }
                        }}
                      >
                        Atualizar Valor
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {isAddingGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="targetAmount">Valor Alvo</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="currentAmount">Valor Atual</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="deadline">Data Limite</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newGoal.category}
                  onValueChange={(value: Goal['category']) => setNewGoal({ ...newGoal, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                    <SelectItem value="debt">Dívida</SelectItem>
                    <SelectItem value="purchase">Compra</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddingGoal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddGoal}
                >
                  Adicionar Meta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 