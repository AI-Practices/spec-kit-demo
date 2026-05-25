import { z } from "zod";
import { CATEGORY_LABELS } from "@/src/server/types";

const today = new Date().toISOString().slice(0, 10);

export const expenseSchema = z.object({
  id: z.string(),
  amount: z.number().int("Amount must be a whole number (cents)").positive("Amount must be positive"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine((val) => val <= today, "Date cannot be in the future"),
  category: z.enum(CATEGORY_LABELS as [string, ...string[]]),
  description: z.string().min(1, "Description is required").max(200, "Description must be 200 characters or less"),
});

export const addExpenseInputSchema = expenseSchema.omit({ id: true });

export const deleteExpenseInputSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
