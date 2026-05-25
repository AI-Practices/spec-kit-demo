import { z } from "zod";

export const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
});

export const updatePersonSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required").trim(),
});

export const deletePersonSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
