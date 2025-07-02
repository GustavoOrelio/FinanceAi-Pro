'use client'

import { useApp } from "@/contexts/AppContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { PurchaseForm } from "./purchase-form"
import { PaymentDialog } from "./payment-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface StoreContentProps {
  storeId: string
}

export function StoreContent({ storeId }: StoreContentProps) {
  const { stores, purchases, removePurchase } = useApp()

  const store = stores.find(s => s.id === storeId)
  if (!store) return <div>Loja não encontrada</div>

  const storePurchases = purchases
    .filter(p => p.storeId === storeId)
    .map(purchase => ({
      ...purchase,
      payments: purchase.payments || []
    }))

  const totalSpent = storePurchases.reduce((acc, p) => acc + p.amount, 0)
  const totalPending = storePurchases.reduce((acc, p) => acc + p.remainingAmount, 0)
  const averagePurchase = storePurchases.length > 0 ? totalSpent / storePurchases.length : 0

  const handleRemovePurchase = (purchaseId: string) => {
    removePurchase(purchaseId)
    toast.success("Compra removida com sucesso!")
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{store.name}</h2>
        {store.description && (
          <p className="text-muted-foreground">{store.description}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePurchase)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="new">Nova Compra</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Nova Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseForm storeId={storeId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Compras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storePurchases.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma compra registrada</p>
                ) : (
                  storePurchases.map(purchase => (
                    <Card key={purchase.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{purchase.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(purchase.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(purchase.amount)}</p>
                              <p className={`text-sm ${purchase.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {purchase.status === 'paid' ? 'Pago' : `Restante: ${formatCurrency(purchase.remainingAmount)}`}
                              </p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Compra</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover esta compra? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemovePurchase(purchase.id)}>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        {purchase.payments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">Pagamentos:</p>
                            {purchase.payments.map(payment => (
                              <div key={payment.id} className="flex items-center justify-between text-sm">
                                <div className="space-x-2">
                                  <span>{new Date(payment.date).toLocaleDateString('pt-BR')}</span>
                                  <span className="uppercase">{payment.method}</span>
                                </div>
                                <span>{formatCurrency(payment.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {purchase.status === 'pending' && (
                          <div className="mt-4">
                            <PaymentDialog
                              purchaseId={purchase.id}
                              remainingAmount={purchase.remainingAmount}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 