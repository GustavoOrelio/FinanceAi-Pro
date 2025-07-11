'use client'

import { useData } from "@/contexts/DataContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { PurchaseForm } from "./purchase-form"
import { PaymentDialog } from "./payment-dialog"
import { BatchPaymentDialog } from "./batch-payment-dialog"
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
  const { stores, purchases, removePurchase } = useData()

  const store = stores.find(s => s.id === storeId)
  if (!store) return <div>Loja não encontrada</div>

  const storePurchases = purchases
    .filter(p => p.storeId === storeId)
    .map(purchase => ({
      ...purchase,
      payments: purchase.payments || []
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const pendingPurchases = storePurchases.filter(p => p.status === 'pending' || p.status === 'partially_paid')
  const totalSpent = storePurchases.reduce((acc, p) => acc + p.amount, 0)
  const totalPending = storePurchases.reduce((acc, p) => acc + (p.remainingAmount || 0), 0)
  const averagePurchase = storePurchases.length > 0 ? totalSpent / storePurchases.length : 0

  const handleRemovePurchase = (purchaseId: string) => {
    removePurchase(purchaseId)
    toast.success("Compra removida com sucesso!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{store.name}</h1>
          <p className="text-muted-foreground">
            {store.category.charAt(0).toUpperCase() + store.category.slice(1)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Média por Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(averagePurchase)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{storePurchases.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <div className="space-y-4">
            <PurchaseForm storeId={storeId} />

            {storePurchases.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhuma compra registrada
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {storePurchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {purchase.description || "Sem descrição"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(purchase.amount)}</p>
                            {purchase.status !== 'paid' && (
                              <p className="text-sm text-muted-foreground">
                                Restante: {formatCurrency(purchase.remainingAmount || 0)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {purchase.status !== 'paid' && (
                              <PaymentDialog
                                purchaseId={purchase.id}
                                remainingAmount={purchase.remainingAmount || 0}
                              />
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
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
                                  <AlertDialogAction
                                    onClick={() => handleRemovePurchase(purchase.id)}
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingPurchases.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhuma compra pendente
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end">
                  <BatchPaymentDialog
                    pendingPurchases={pendingPurchases.map(p => ({
                      id: p.id,
                      description: p.description || "Sem descrição",
                      remainingAmount: p.remainingAmount || 0
                    }))}
                  />
                </div>

                <div className="space-y-4">
                  {pendingPurchases.map((purchase) => (
                    <Card key={purchase.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {purchase.description || "Sem descrição"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(purchase.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(purchase.amount)}</p>
                              <p className="text-sm text-muted-foreground">
                                Restante: {formatCurrency(purchase.remainingAmount || 0)}
                              </p>
                            </div>
                            <PaymentDialog
                              purchaseId={purchase.id}
                              remainingAmount={purchase.remainingAmount || 0}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 