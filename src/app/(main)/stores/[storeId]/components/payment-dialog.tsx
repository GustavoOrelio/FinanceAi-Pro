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

const paymentFormSchema = z.object({
  amount: z.string().min(1, "Valor é obrigatório"),
  method: z.enum(["pix", "credit", "debit", "cash"], {
    required_error: "Selecione um método de pagamento",
  }),
  date: z.string().min(1, "Data é obrigatória"),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

interface PaymentDialogProps {
  purchaseId: string
  remainingAmount: number
  onPaymentSuccess?: () => void
}

export function PaymentDialog({ purchaseId, remainingAmount, onPaymentSuccess }: PaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addPayment } = useApp()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingAmount.toString(),
      method: "pix",
      date: new Date().toISOString().split("T")[0],
    },
  })

  async function onSubmit(data: PaymentFormValues) {
    try {
      setIsLoading(true)
      const paymentAmount = parseFloat(data.amount)

      if (paymentAmount > remainingAmount) {
        toast.error("O valor do pagamento não pode ser maior que o valor restante")
        return
      }

      if (paymentAmount <= 0) {
        toast.error("O valor do pagamento deve ser maior que zero")
        return
      }

      const payment = {
        id: Date.now().toString(),
        purchaseId,
        amount: paymentAmount,
        method: data.method,
        date: new Date(data.date),
      }

      addPayment(payment)
      toast.success("Pagamento registrado com sucesso!")
      form.reset()
      setOpen(false)
      onPaymentSuccess?.()
    } catch (error) {
      toast.error("Erro ao registrar pagamento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Registrar Pagamento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Valor restante: {formatCurrency(remainingAmount)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar Pagamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 