'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Send, Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    monthlySpending?: number;
    monthlyLimit?: number;
    goals?: Array<{
      title: string;
      progress: number;
    }>;
    recentTransactions?: Array<{
      description: string;
      amount: number;
      date: string;
    }>;
  };
}

export default function AIAssistantPage() {
  const { user, purchases, goals, monthlyLimit } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, error } = useVoiceRecognition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Prepara o contexto financeiro para o assistente
  const getFinancialContext = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calcula gastos do mês atual
    const currentMonthPurchases = purchases.filter(purchase => {
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
      .map(purchase => ({
        description: purchase.description || 'Sem descrição',
        amount: purchase.amount,
        date: purchase.date,
      }));

    // Prepara informações das metas
    const goalsInfo = goals.map(goal => ({
      title: goal.title,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
    }));

    return {
      monthlySpending,
      monthlyLimit,
      goals: goalsInfo,
      recentTransactions,
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

      // Aqui você faria a chamada para sua API de IA
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context,
          history: messages.map(msg => ({
            role: msg.type,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar a mensagem');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        context,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar sua mensagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setInput(prev => prev + ' ' + transcript);
      }
      resetTranscript();
    } else {
      startListening();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="h-[calc(100vh-6rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Assistente FinanceAI</CardTitle>
          <CardDescription>
            Tire suas dúvidas e receba orientações financeiras personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <ScrollArea
            ref={scrollRef}
            className="flex-1 pr-4"
          >
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4" />
                  <p>Olá! Como posso ajudar você hoje?</p>
                  <p className="text-sm mt-2">
                    Você pode me perguntar sobre:
                  </p>
                  <ul className="text-sm mt-1">
                    <li>• Análise dos seus gastos</li>
                    <li>• Dicas para economizar</li>
                    <li>• Progresso das suas metas</li>
                    <li>• Recomendações de investimento</li>
                  </ul>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                      }`}
                  >
                    <Avatar className="h-8 w-8">
                      {message.type === 'assistant' ? (
                        <>
                          <AvatarImage src="/icons/bot-avatar.png" alt="AI Assistant" />
                          <AvatarFallback>AI</AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback>
                            {user?.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-4 max-w-[80%] ${message.type === 'assistant'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground ml-auto'
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.context && message.type === 'assistant' && (
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          <p>
                            Gastos do mês: {formatCurrency(message.context.monthlySpending || 0)}
                            {message.context.monthlyLimit && (
                              <> de {formatCurrency(message.context.monthlyLimit)}</>
                            )}
                          </p>
                          {message.context.goals && message.context.goals.length > 0 && (
                            <p className="mt-1">
                              Principal meta: {message.context.goals[0].title} (
                              {Math.round(message.context.goals[0].progress)}% concluída)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processando...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                variant={isListening ? 'destructive' : 'outline'}
                onClick={handleVoiceInput}
                disabled={!!error}
                title={error || 'Usar microfone'}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 