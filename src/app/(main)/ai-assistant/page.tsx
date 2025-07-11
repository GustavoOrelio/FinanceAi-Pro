'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
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
  const { user, isAuthenticated } = useAuth();
  const { purchases, goals } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await aiService.chat({
        message: userMessage.content,
        context: {
          user,
          purchases,
          goals,
        },
        history: messages,
      });

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      toast.error('Erro ao processar mensagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          disabled={isProcessing}
        />
        {isSupported && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              toggleListening();
              if (!isListening) {
                setInput('');
              }
            }}
            className={isListening ? 'bg-red-100 hover:bg-red-200' : ''}
          >
            {isListening ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
        <Button
          onClick={handleSendMessage}
          disabled={!input.trim() || isProcessing}
        >
          {isProcessing ? 'Processando...' : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 