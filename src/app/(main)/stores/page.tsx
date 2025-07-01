'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Store as StoreIcon, Plus, Trash2 } from 'lucide-react';

export default function StoresPage() {
  const { stores, purchases, addStore, removeStore } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [newStore, setNewStore] = useState({
    name: '',
    category: '',
    logo: '',
  });

  // Cálculos de estatísticas por loja
  const storeStats = stores.map(store => {
    const storePurchases = purchases.filter(p => p.storeId === store.id);
    const totalSpent = storePurchases.reduce((total, p) => total + p.amount, 0);
    const averageSpent = storePurchases.length > 0 ? totalSpent / storePurchases.length : 0;

    return {
      ...store,
      totalSpent,
      averageSpent,
      purchaseCount: storePurchases.length,
    };
  });

  // Filtragem de lojas
  const filteredStores = storeStats.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStore = () => {
    if (newStore.name && newStore.category) {
      addStore({
        id: Date.now().toString(), // Temporário, deve vir da API
        ...newStore,
      });
      setNewStore({ name: '', category: '', logo: '' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciar Lojas</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Loja</DialogTitle>
              <DialogDescription>
                Preencha os dados da loja para começar a registrar compras.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Loja</Label>
                <Input
                  id="name"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="Ex: Mercado do Bairro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={newStore.category}
                  onChange={(e) => setNewStore({ ...newStore, category: e.target.value })}
                  placeholder="Ex: Supermercado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">URL do Logo (opcional)</Label>
                <Input
                  id="logo"
                  value={newStore.logo}
                  onChange={(e) => setNewStore({ ...newStore, logo: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddStore}>Adicionar Loja</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        {filteredStores.map((store) => (
          <Card key={store.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={store.logo} alt={store.name} />
                  <AvatarFallback>
                    <StoreIcon className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{store.name}</CardTitle>
                  <CardDescription>{store.category}</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeStore(store.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Gasto</p>
                  <p className="text-lg font-medium">
                    R$ {store.totalSpent.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Média por Compra</p>
                  <p className="text-lg font-medium">
                    R$ {store.averageSpent.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-sm text-muted-foreground">Compras Registradas</p>
                  <p className="text-lg font-medium">{store.purchaseCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 