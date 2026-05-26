import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createCreditSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  amount: z.number().int("Amount must be a whole number").nonnegative("Amount must be 0 or more"),
  date: z.string().regex(dateRegex, "Date must be YYYY-MM-DD"),
  notes: z.string().optional(),
});

export const createDebitSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  amount: z.number().int("Amount must be a whole number").positive("Amount must be positive"),
  date: z.string().regex(dateRegex, "Date must be YYYY-MM-DD"),
  notes: z.string().min(1, "Notes/reason is required for debits"),
});

export const monthlyCreditsSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export const personSummarySchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
});

export const deleteTransactionSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
});
