'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createPerson, getPersons } from "@/src/server/actions/persons";
import type { PersonWithBalance } from "@/src/server/types";

function formatAmount(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}

function EmptyPersonState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg className="w-16 h-16 mb-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
      <h2 className="text-xl font-semibold text-zinc-800 mb-2 dark:text-zinc-200">No persons yet</h2>
      <p className="text-zinc-500 mb-6 dark:text-zinc-400">
        Add a person to start tracking their wallet balance.
      </p>
    </div>
  );
}

export default function PersonList() {
  const [persons, setPersons] = useState<PersonWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  const fetchPersons = useCallback(async () => {
    const result = await getPersons();
    if (result.success) {
      setPersons(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    const result = await createPerson({ name });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setName("");
    await fetchPersons();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-zinc-500 dark:text-zinc-400">Loading persons...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Persons</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-3 mb-8">
        <div className="flex-1">
          <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-zinc-300">
            New person name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            required
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-800 dark:border-zinc-600 dark:focus:ring-zinc-500"
          />
          {errors?.name && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">{errors.name[0]}</p>
          )}
          {errors?._form && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">{errors._form[0]}</p>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-500"
        >
          Add Person
        </button>
      </form>

      {persons.length === 0 ? (
        <EmptyPersonState />
      ) : (
        <div className="space-y-2">
          {persons.map((person) => (
            <Link
              key={person.id}
              href={`/persons/${person.id}`}
              className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {person.name}
              </span>
              <span
                className={`text-sm font-medium tabular-nums ${
                  person.balance >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatAmount(person.balance)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
