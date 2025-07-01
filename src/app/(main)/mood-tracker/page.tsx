'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const MOODS = [
  { value: 5, label: 'Muito Feliz', color: '#22c55e' },
  { value: 4, label: 'Feliz', color: '#84cc16' },
  { value: 3, label: 'Neutro', color: '#facc15' },
  { value: 2, label: 'Triste', color: '#f97316' },
  { value: 1, label: 'Muito Triste', color: '#ef4444' },
] as const;

// Dados simulados para o gráfico
const data = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  mood: Math.floor(Math.random() * 5) + 1,
}));

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!selectedMood) {
      toast.error('Selecione seu humor');
      return;
    }

    // Aqui você implementaria a lógica real de salvamento
    toast.success('Humor registrado com sucesso!');
    setSelectedMood(null);
    setNote('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Rastreador de Humor</h1>
        <p className="text-muted-foreground">
          Acompanhe seu humor e identifique padrões em seus gastos
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Como você está se sentindo?</CardTitle>
            <CardDescription>
              Selecione seu humor atual e adicione uma nota opcional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((mood) => (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? 'default' : 'outline'}
                  className="flex flex-col items-center p-4 h-auto"
                  style={{
                    backgroundColor: selectedMood === mood.value ? mood.color : undefined,
                    borderColor: mood.color,
                    color: selectedMood === mood.value ? 'white' : mood.color,
                  }}
                  onClick={() => setSelectedMood(mood.value)}
                >
                  <span className="text-2xl mb-2">
                    {mood.value === 5 ? '😄' :
                      mood.value === 4 ? '🙂' :
                        mood.value === 3 ? '😐' :
                          mood.value === 2 ? '🙁' :
                            '😢'}
                  </span>
                  <span className="text-xs text-center">{mood.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Nota (opcional)</Label>
              <Textarea
                id="note"
                placeholder="Como você está se sentindo? O que aconteceu hoje?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!selectedMood}
            >
              Registrar Humor
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Humor</CardTitle>
            <CardDescription>
              Visualize a evolução do seu humor ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(value) => {
                      const mood = MOODS.find(m => m.value === value);
                      return mood ? mood.label : '';
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const mood = MOODS.find(m => m.value === payload[0].value);
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-sm">{payload[0].payload.date}</p>
                            <p className="text-sm font-bold">{mood?.label}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 