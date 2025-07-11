import * as z from "zod";

// User Schemas
export const userSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

// Purchase Schemas
export const purchaseSchema = z.object({
  storeId: z.string().min(1, "A loja é obrigatória"),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  paidAmount: z.number().min(0, "O valor pago não pode ser negativo"),
  date: z.string().min(1, "A data é obrigatória"),
  category: z.string().min(1, "A categoria é obrigatória"),
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres"),
  status: z.enum(["pending", "paid", "cancelled"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
  installments: z.number().optional(),
});

// Store Schemas
export const storeSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  category: z.string().min(1, "A categoria é obrigatória"),
  logo: z.string().optional(),
});

// Payment Schemas
export const paymentSchema = z.object({
  purchaseId: z.string().min(1, "A compra é obrigatória"),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  method: z.enum(["pix", "credit", "debit", "cash"], {
    errorMap: () => ({ message: "Método de pagamento inválido" }),
  }),
  date: z.string().min(1, "A data é obrigatória"),
});

// Goal Schemas
export const goalSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  targetAmount: z.number().min(0.01, "O valor deve ser maior que zero"),
  currentAmount: z.number().min(0, "O valor atual não pode ser negativo"),
  deadline: z.string().min(1, "A data limite é obrigatória"),
  category: z.string().min(1, "A categoria é obrigatória"),
  description: z.string().optional(),
});

// Type exports
export type UserFormValues = z.infer<typeof userSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export type StoreFormValues = z.infer<typeof storeSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type GoalFormValues = z.infer<typeof goalSchema>;
