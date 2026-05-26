'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPerson, getPersons, updatePerson, deletePerson } from "@/src/server/actions/persons";
import type { PersonWithBalance } from "@/src/server/types";
import { useCurrency } from "@/lib/use-currency";
import TemplateDownload from "./template-download";

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
  const { formatAmount } = useCurrency();
  const [persons, setPersons] = useState<PersonWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    getPersons().then((result) => {
      if (result.success) setPersons(result.data);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    setDuplicateWarning(null);

    const exists = persons.some((p) => p.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      setDuplicateWarning(`A person named "${name.trim()}" already exists. You can still add another with the same name.`);
    }

    const result = await createPerson({ name });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setName("");
    const refreshed = await getPersons();
    if (refreshed.success) setPersons(refreshed.data);
  }

  function startEdit(person: PersonWithBalance) {
    setEditingId(person.id);
    setEditName(person.name);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    const result = await updatePerson({ id, name: editName });
    if (result.success) {
      const refreshed = await getPersons();
      if (refreshed.success) setPersons(refreshed.data);
    }
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
  }

  async function executeDelete(id: string) {
    const result = await deletePerson({ id });
    if (result.success) {
      const refreshed = await getPersons();
      if (refreshed.success) setPersons(refreshed.data);
    }
    setDeletingId(null);
  }

  function cancelDelete() {
    setDeletingId(null);
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
        <TemplateDownload />
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
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent dark:bg-zinc-800 dark:border-zinc-600"
          />
          {duplicateWarning && (
            <p className="text-sm text-amber-600 mt-1 dark:text-amber-400">{duplicateWarning}</p>
          )}
          {errors?.name && (
            <p className="text-sm text-negative mt-1 dark:text-negative">{errors.name[0]}</p>
          )}
          {errors?._form && (
            <p className="text-sm text-negative mt-1 dark:text-negative">{errors._form[0]}</p>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Add Person
        </button>
      </form>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Delete Person?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              This will permanently delete this person and all their transactions. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-zinc-600 border border-zinc-300 rounded transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => executeDelete(deletingId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {persons.length === 0 ? (
        <EmptyPersonState />
      ) : (
        <div className="space-y-2">
          {persons.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface shadow-sm dark:bg-zinc-800 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {editingId === person.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => saveEdit(person.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(person.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-full border border-zinc-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Link
                    href={`/persons/${person.id}`}
                    className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate"
                  >
                    {person.name}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-sm font-medium tabular-nums ${
                    person.balance >= 0
                      ? "text-positive"
                      : "text-negative"
                  }`}
                >
                  {formatAmount(person.balance)}
                </span>
                {editingId === person.id ? (
                  <button
                    onClick={() => saveEdit(person.id)}
                    className="px-2 py-1 text-xs font-medium text-positive transition-colors hover:text-positive hover:bg-positive/10 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(person)}
                    className="px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-accent hover:bg-accent/5 rounded"
                  >
                    Edit
                  </button>
                )}
                <button
                    onClick={() => confirmDelete(person.id)}
                  className="px-2 py-1 text-xs font-medium text-negative transition-colors hover:text-negative hover:bg-negative/10 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
