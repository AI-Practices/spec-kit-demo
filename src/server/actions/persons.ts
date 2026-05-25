'use server';

import { prisma } from "@/src/server/db";
import { createPersonSchema } from "@/src/server/schemas/person";
import type { ActionResult, PersonWithBalance } from "@/src/server/types";
import { revalidatePath } from "next/cache";

const DEFAULT_USER_EMAIL = "admin@local.dev";

async function ensureUser(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: {
      email: DEFAULT_USER_EMAIL,
      name: "Default User",
    },
  });
  return user.id;
}

async function computeBalance(personId: string, userId: string): Promise<number> {
  const credits = await prisma.walletTransaction.aggregate({
    where: { personId, userId, type: "credit" },
    _sum: { amount: true },
  });
  const debits = await prisma.walletTransaction.aggregate({
    where: { personId, userId, type: "debit" },
    _sum: { amount: true },
  });
  return (credits._sum.amount ?? 0) - (debits._sum.amount ?? 0);
}

function serializePerson(person: {
  id: string; userId: string; name: string;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
}): PersonWithBalance {
  return {
    id: person.id,
    userId: person.userId,
    name: person.name,
    createdAt: person.createdAt.toISOString(),
    updatedAt: person.updatedAt.toISOString(),
    deletedAt: person.deletedAt?.toISOString() ?? null,
    balance: 0,
  };
}

export async function createPerson(
  input: unknown
): Promise<ActionResult<PersonWithBalance>> {
  const parsed = createPersonSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    const userId = await ensureUser();
    const person = await prisma.person.create({
      data: { userId, name: parsed.data.name },
    });
    revalidatePath("/persons");
    return {
      success: true,
      data: { ...serializePerson(person), balance: 0 },
    };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Failed to create person"] },
    };
  }
}

export async function getPersons(): Promise<ActionResult<PersonWithBalance[]>> {
  try {
    const userId = await ensureUser();
    const persons = await prisma.person.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    const withBalance = await Promise.all(
      persons.map(async (p) => ({
        ...serializePerson(p),
        balance: await computeBalance(p.id, userId),
      }))
    );
    return { success: true, data: withBalance };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Failed to fetch persons"] },
    };
  }
}

export async function getPerson(id: string): Promise<ActionResult<PersonWithBalance>> {
  try {
    const userId = await ensureUser();
    const person = await prisma.person.findUniqueOrThrow({
      where: { id, userId },
    });
    return {
      success: true,
      data: {
        ...serializePerson(person),
        balance: await computeBalance(person.id, userId),
      },
    };
  } catch (err) {
    return {
      success: false,
      errors: { _form: [err instanceof Error ? err.message : "Person not found"] },
    };
  }
}
