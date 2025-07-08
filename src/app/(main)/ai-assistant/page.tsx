'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Send, StopCircle } from 'lucide-react';
import { aiService } from '@/services/api';
import { toast } from 'sonner';

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isListening, transcript, toggleListening, resetTranscript, isSupported } = useVoiceRecognition({
    onTranscriptChange: (newTranscript) => {
      console.log("Novo texto reconhecido:", newTranscript);
      setInput(newTranscript);
    }
  });
  const { user, isAuthenticated, isHydrated, purchases, goals } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Prepara o contexto financeiro para o assistente
  const getFinancialContext = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calcula gastos do mês atual
    const currentMonthPurchases = purchases.filter((purchase) => {
      const purchaseDate = new Date(purchase.date);
      return purchaseDate.getMonth() === currentMonth &&
        purchaseDate.getFullYear() === currentYear;
    });

    const monthlySpending = currentMonthPurchases.reduce(
      (total, purchase) => total + purchase.amount,
      0
    );

    // Pega as transações mais recentes
    const recentTransactions = purchases
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((purchase) => ({
        description: purchase.description,
        amount: purchase.amount,
        date: purchase.date
      }));

    // Formata as metas
    const formattedGoals = goals.map((goal) => ({
      title: goal.title,
      progress: Math.round((goal.currentAmount / goal.targetAmount) * 100)
    }));

    return {
      monthlySpending,
      monthlyLimit: user?.monthlyLimit,
      goals: formattedGoals,
      recentTransactions
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const context = getFinancialContext();
      const data = await aiService.chat({
        message: input,
        context,
        history: messages.map(msg => ({
          role: msg.type,
          content: msg.content
        }))
      });

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar a mensagem. Por favor, tente novamente.');
      // Adiciona mensagem de erro
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Não renderiza nada enquanto verifica autenticação ou hidratação
  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto">
      <Card className="flex-1 mb-4 overflow-hidden">
        <CardContent className="h-full p-6">
          <div className="h-full overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <h3 className="text-lg font-semibold mb-2">Bem-vindo ao Assistente FinanceAI!</h3>
                <p className="max-w-sm">
                  Estou aqui para ajudar você a gerenciar suas finanças de forma inteligente.
                  Como posso ajudar você hoje?
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 shadow ${message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted mr-4'
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="px-4 pb-6">
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            disabled={isProcessing || !isSupported}
            className={`shrink-0 transition-colors ${isListening ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800' : ''}`}
            title={!isSupported ? "Reconhecimento de voz não suportado neste navegador" : "Clique para falar"}
          >
            {isListening ? (
              <StopCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Mic className={`h-5 w-5 ${!isSupported ? 'text-muted-foreground' : ''}`} />
            )}
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isProcessing || isListening}
            className="flex-1"
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing || isListening}
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 