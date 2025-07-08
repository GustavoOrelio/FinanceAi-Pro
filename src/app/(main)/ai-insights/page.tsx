'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
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

// Componente de carregamento
function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState('predictions');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const { user, isAuthenticated, isHydrated, purchases, goals } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

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
        user?.monthlyLimit || 0
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-500';
    if (confidence >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Insights de IA</h1>
        <Button onClick={loadInsights} disabled={isLoading}>
          {isLoading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Previsões
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Padrões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          {isLoading ? (
            <LoadingState />
          ) : !predictions?.length ? (
            <EmptyState message="Nenhuma previsão disponível. Adicione mais transações para obter insights." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((prediction, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{prediction.category}</CardTitle>
                    <CardDescription>
                      Previsão para o próximo mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">
                        R$ {prediction.predictedAmount.toFixed(2)}
                      </p>
                      <p className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
                        Confiança: {(prediction.confidence * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {prediction.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {isLoading ? (
            <LoadingState />
          ) : !recommendations?.length ? (
            <EmptyState message="Nenhuma recomendação disponível. Adicione mais dados financeiros para receber sugestões personalizadas." />
          ) : (
            recommendations.map((recommendation, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{recommendation.title}</CardTitle>
                    <span className={`text-sm font-medium ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority.toUpperCase()}
                    </span>
                  </div>
                  <CardDescription>
                    Tipo: {recommendation.type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>{recommendation.description}</p>
                    <p className="text-sm font-medium">
                      Impacto potencial: {recommendation.potentialImpact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {isLoading ? (
            <LoadingState />
          ) : !patterns?.length ? (
            <EmptyState message="Nenhum padrão identificado. Continue registrando suas transações para obter análises detalhadas." />
          ) : (
            patterns.map((pattern, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{pattern.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Padrão Identificado</h4>
                      <p className="text-sm text-muted-foreground">{pattern.pattern}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Insight</h4>
                      <p className="text-sm text-muted-foreground">{pattern.insight}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Sugestão</h4>
                      <p className="text-sm text-muted-foreground">{pattern.suggestion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 