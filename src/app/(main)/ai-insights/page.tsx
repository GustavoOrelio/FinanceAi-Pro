'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, Target, Brain, TrendingUp } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';

// Componente de estado vazio
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <p className="mb-4">{message}</p>
      <Brain className="w-12 h-12 opacity-50" />
    </div>
  );
}

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState('predictions');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuth();
  const { purchases, goals, monthlyLimit } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadInsights();
    }
  }, [isAuthenticated, user]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      // Obtém categorias únicas das compras
      const categories = [...new Set(purchases.map(p => p.category))];

      // Carrega previsões
      const predictionsData = await aiService.predictSpending(purchases, categories);
      setPredictions(predictionsData);

      // Carrega recomendações
      const recommendationsData = await aiService.getRecommendations(
        purchases,
        goals,
        monthlyLimit
      );
      setRecommendations(recommendationsData);

      // Carrega padrões
      const patternsData = await aiService.analyzeConsumptionPatterns(purchases);
      setPatterns(patternsData);

    } catch (error) {
      console.error('Erro ao carregar insights:', error);
      toast.error('Erro ao carregar insights');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Insights AI</h1>
        <p className="text-muted-foreground">
          Análises e recomendações personalizadas baseadas em IA
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <div className="grid gap-4 md:grid-cols-2">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{prediction.category}</CardTitle>
                  <CardDescription>
                    Confiança: {prediction.confidence}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-2">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(prediction.predictedAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {prediction.explanation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((recommendation, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{recommendation.title}</CardTitle>
                  <CardDescription>
                    Prioridade:{' '}
                    <span className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{recommendation.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Impacto potencial: {recommendation.potentialImpact}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <div className="grid gap-4 md:grid-cols-2">
            {patterns.map((pattern, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{pattern.category}</CardTitle>
                  <CardDescription>{pattern.pattern}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{pattern.insight}</p>
                  <p className="text-sm text-muted-foreground">
                    Sugestão: {pattern.suggestion}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 