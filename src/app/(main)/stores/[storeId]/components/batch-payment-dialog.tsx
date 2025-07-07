'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useApp } from "@/contexts/AppContext"
import { formatCurrency } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const batchPaymentFormSchema = z.object({
  amount: z.string().min(1, "Valor é obrigatório"),
  method: z.enum(["pix", "credit", "debit", "cash"], {
    required_error: "Selecione um método de pagamento",
  }),
  date: z.string().min(1, "Data é obrigatória"),
})

type BatchPaymentFormValues = z.infer<typeof batchPaymentFormSchema>

interface Payment {
  id: string
  purchaseId: string
  amount: number
  method: 'pix' | 'credit' | 'debit' | 'cash'
  date: string
}

interface BatchPaymentDialogProps {
  pendingPurchases: Array<{
    id: string
    description: string
    remainingAmount: number
  }>
  onPaymentSuccess?: () => void
}

export function BatchPaymentDialog({ pendingPurchases, onPaymentSuccess }: BatchPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([])
  const { addPayment } = useApp()

  const totalRemaining = pendingPurchases
    .filter(p => selectedPurchases.includes(p.id))
    .reduce((acc, p) => acc + p.remainingAmount, 0)

  const form = useForm<BatchPaymentFormValues>({
    resolver: zodResolver(batchPaymentFormSchema),
    defaultValues: {
      amount: totalRemaining.toString(),
      method: "pix",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const togglePurchase = (purchaseId: string) => {
    setSelectedPurchases(current => {
      const isSelected = current.includes(purchaseId)
      if (isSelected) {
        return current.filter(id => id !== purchaseId)
      } else {
        return [...current, purchaseId]
      }
    })
  }

  async function onSubmit(data: BatchPaymentFormValues) {
    try {
      setIsLoading(true)
      const paymentAmount = parseFloat(data.amount)

      if (paymentAmount <= 0) {
        toast.error("O valor do pagamento deve ser maior que zero")
        return
      }

      if (paymentAmount > totalRemaining) {
        toast.error("O valor do pagamento não pode ser maior que o total restante")
        return
      }

      if (selectedPurchases.length === 0) {
        toast.error("Selecione pelo menos uma compra para pagar")
        return
      }

      // Distribuir o pagamento entre todas as compras selecionadas
      const selectedPurchaseDetails = pendingPurchases
        .filter(p => selectedPurchases.includes(p.id))
        .sort((a, b) => b.remainingAmount - a.remainingAmount) // Ordenar do maior para o menor

      let remainingPayment = paymentAmount
      const payments: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>[] = []

      // Distribuir o pagamento entre todas as compras selecionadas
      for (const purchase of selectedPurchaseDetails) {
        if (remainingPayment <= 0) break;

        // Determinar quanto será pago nesta compra
        const paymentForThisPurchase = Math.min(remainingPayment, purchase.remainingAmount);

        const payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> = {
          purchaseId: purchase.id,
          amount: paymentForThisPurchase,
          method: data.method,
          date: data.date,
        };
        payments.push(payment);

        remainingPayment = Math.max(0, remainingPayment - paymentForThisPurchase);
      }

      // Registrar todos os pagamentos
      for (const payment of payments) {
        addPayment(payment);
      }

      toast.success("Pagamentos registrados com sucesso!")
      form.reset()
      setOpen(false)
      setSelectedPurchases([])
      onPaymentSuccess?.()
    } catch (error) {
      console.error('Erro ao registrar pagamentos:', error)
      toast.error("Erro ao registrar pagamentos. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Pagar Várias Compras ({pendingPurchases.length} compras pendentes - Total: {formatCurrency(pendingPurchases.reduce((acc, p) => acc + p.remainingAmount, 0))})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pagamento em Lote</DialogTitle>
          <DialogDescription>
            Selecione as compras e informe o valor total do pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-4">
              {pendingPurchases.map(purchase => (
                <div key={purchase.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={purchase.id}
                    checked={selectedPurchases.includes(purchase.id)}
                    onCheckedChange={() => togglePurchase(purchase.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={purchase.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {purchase.description}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Restante: {formatCurrency(purchase.remainingAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedPurchases.length > 0 && (
            <div className="text-sm">
              Total selecionado: {formatCurrency(totalRemaining)}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total do Pagamento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="credit">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit">Cartão de Débito</SelectItem>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isLoading || selectedPurchases.length === 0}>
                  {isLoading ? "Registrando..." : "Registrar Pagamento"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 