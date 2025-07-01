'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

interface AddPurchaseFormProps {
  storeId: string;
  onSuccess?: () => void;
}

export function AddPurchaseForm({ storeId, onSuccess }: AddPurchaseFormProps) {
  const { addPurchase } = useApp();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const { isListening, toggleListening, transcript } = useVoiceRecognition({
    onTranscriptChange: setDescription
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    const purchase = {
      id: Date.now().toString(),
      storeId,
      userId: 'user-1', // TODO: Get from auth context
      amount: parseFloat(amount),
      paidAmount: 0,
      remainingAmount: parseFloat(amount),
      date: new Date().toISOString(),
      category,
      description: description || undefined,
      status: 'pending' as const,
      payments: []
    };

    addPurchase(purchase);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Alimentação</SelectItem>
            <SelectItem value="clothing">Vestuário</SelectItem>
            <SelectItem value="electronics">Eletrônicos</SelectItem>
            <SelectItem value="home">Casa</SelectItem>
            <SelectItem value="other">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Descrição</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleListening}
            className={isListening ? 'bg-red-100' : ''}
          >
            {isListening ? 'Parar' : 'Falar'} 🎤
          </Button>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhes da compra..."
          className="h-20"
        />
      </div>

      <Button type="submit" className="w-full">
        Adicionar Compra
      </Button>
    </form>
  );
} 