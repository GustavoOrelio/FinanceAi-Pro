import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useApp } from "@/contexts/AppContext"

const paymentFormSchema = z.object({
  amount: z.string().min(1, "Valor é obrigatório"),
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  purchaseId: string
  totalAmount: number
  remainingAmount: number
  onSuccess?: () => void
}

export function PaymentForm({ purchaseId, totalAmount, remainingAmount, onSuccess }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { purchases, updatePurchase } = useApp()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingAmount.toString(),
      paymentMethod: "pix",
    },
  })

  async function onSubmit(data: PaymentFormValues) {
    try {
      setIsLoading(true)

      const paymentAmount = parseFloat(data.amount)

      if (paymentAmount > remainingAmount) {
        toast.error("O valor do pagamento não pode ser maior que o valor restante", {
          description: `Valor restante: R$ ${remainingAmount.toFixed(2)}`
        })
        return
      }

      const purchase = purchases.find(p => p.id === purchaseId)
      if (!purchase) {
        toast.error("Compra não encontrada")
        return
      }

      const newPaidAmount = (purchase.paidAmount || 0) + paymentAmount
      const newRemainingAmount = totalAmount - newPaidAmount

      // Atualiza o status da compra
      const newStatus = newRemainingAmount <= 0 ? "paid" : "pending"

      // Adiciona o novo pagamento
      const payment = {
        id: Date.now().toString(),
        purchaseId,
        amount: paymentAmount,
        method: data.paymentMethod as "credit" | "debit" | "pix" | "money",
        date: new Date().toISOString(),
      }

      updatePurchase({
        ...purchase,
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
        payments: [...(purchase.payments || []), payment],
      })

      toast.success("Pagamento registrado com sucesso!")
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error("Erro ao registrar pagamento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Pagamento</FormLabel>
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
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  disabled={isLoading}
                >
                  <option value="pix">PIX</option>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                  <option value="money">Dinheiro</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-sm text-muted-foreground mb-4">
          <p>Valor total: R$ {totalAmount.toFixed(2)}</p>
          <p>Valor restante: R$ {remainingAmount.toFixed(2)}</p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processando..." : "Registrar Pagamento"}
        </Button>
      </form>
    </Form>
  )
} 