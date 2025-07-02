'use client'

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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useApp } from "@/contexts/AppContext"

const purchaseFormSchema = z.object({
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  date: z.string().min(1, "Data é obrigatória"),
})

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>

interface PurchaseFormProps {
  storeId: string
  onSuccess?: () => void
}

export function PurchaseForm({ storeId, onSuccess }: PurchaseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user, addPurchase } = useApp()

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  async function onSubmit(data: PurchaseFormValues) {
    try {
      setIsLoading(true)

      const purchase = {
        id: Date.now().toString(),
        storeId,
        userId: user?.id || "",
        amount: parseFloat(data.amount),
        paidAmount: 0,
        remainingAmount: parseFloat(data.amount),
        date: data.date,
        category: "other",
        description: data.description,
        status: "pending" as const,
        payments: [],
      }

      addPurchase(purchase)

      toast.success("Compra registrada com sucesso!")
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error("Erro ao registrar compra. Tente novamente.")
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os itens comprados"
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Compra"}
        </Button>
      </form>
    </Form>
  )
} 