import { z } from "zod";
import { CATEGORY_LABELS } from "@/src/server/types";

export const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const budgetSchema = z.object({
  id: z.string(),
  category: z.enum(CATEGORY_LABELS as [string, ...string[]]),
  amount: z.number().int("Amount must be a whole number (cents)").positive("Amount must be positive"),
  month: z.string().regex(monthRegex, "Month must be YYYY-MM format"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const setBudgetInputSchema = z.object({
  category: z.enum(CATEGORY_LABELS as [string, ...string[]]),
  amount: z.number().int("Amount must be a whole number (cents)").positive("Amount must be positive"),
  month: z.string().regex(monthRegex, "Month must be YYYY-MM format"),
});

export const removeBudgetInputSchema = z.object({
  category: z.enum(CATEGORY_LABELS as [string, ...string[]]),
  month: z.string().regex(monthRegex, "Month must be YYYY-MM format"),
});
