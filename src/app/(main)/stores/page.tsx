'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store } from '@/app/components/Store';
import type { Store as StoreType } from '@/lib/types';

export default function StoresPage() {
  const { stores, addStore } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    category: '',
  });

  // Filtragem de lojas
  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStore = () => {
    if (newStore.name && newStore.category) {
      const now = new Date();
      addStore({
        id: Date.now().toString(),
        ...newStore,
        createdAt: now,
        updatedAt: now,
      });
      setNewStore({ name: '', category: '' });
      setIsAddingStore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Minhas Lojas</h1>
        <Button onClick={() => setIsAddingStore(true)}>
          Nova Loja
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar lojas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStores.length === 0 ? (
          <Card className="col-span-full p-6 text-center text-muted-foreground">
            {searchTerm ? 'Nenhuma loja encontrada' : 'Nenhuma loja cadastrada'}
          </Card>
        ) : (
          filteredStores.map((store) => (
            <Store key={store.id} id={store.id} />
          ))
        )}
      </div>

      <Dialog open={isAddingStore} onOpenChange={setIsAddingStore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Loja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                placeholder="Nome da loja"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={newStore.category}
                onValueChange={(value) => setNewStore({ ...newStore, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supermercado">Supermercado</SelectItem>
                  <SelectItem value="restaurante">Restaurante</SelectItem>
                  <SelectItem value="farmacia">Farmácia</SelectItem>
                  <SelectItem value="vestuario">Vestuário</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleAddStore}
              disabled={!newStore.name || !newStore.category}
            >
              Adicionar Loja
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 