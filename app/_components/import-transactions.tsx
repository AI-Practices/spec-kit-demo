"use client";

import { useState, useRef, useCallback } from "react";
import { importTransactions } from "@/src/server/actions/import-transactions";
import type { ParsedTransaction, ImportResult } from "@/lib/excel-utils";
import type { ImportPreview } from "@/src/server/actions/import-transactions";

interface ImportTransactionsProps {
  personId: string;
  onImportComplete?: () => void;
}

type ImportState =
  | { phase: "idle" }
  | { phase: "parsing" }
  | { phase: "preview"; preview: ParsedTransaction[]; sheetName: string; month: number; year: number; availableSheets: string[] }
  | { phase: "importing" }
  | { phase: "success"; result: ImportResult }
  | { phase: "error"; message: string };

export default function ImportTransactions({ personId, onImportComplete }: ImportTransactionsProps) {
  const [state, setState] = useState<ImportState>({ phase: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const currentFileRef = useRef<File | null>(null);

  const parseFile = useCallback(async (file: File, sheetName?: string) => {
    currentFileRef.current = file;
    setState({ phase: "parsing" });

    const fd = new FormData();
    fd.set("file", file);
    fd.set("personId", personId);
    if (sheetName) fd.set("sheetName", sheetName);

    const result = await importTransactions(fd);

    if (!result.success) {
      const msg = result.errors.file?.[0] ?? result.errors._form?.[0] ?? "Failed to parse file";
      setState({ phase: "error", message: msg });
      return;
    }

    const data = result.data as ImportPreview;
    if ("preview" in data) {
      setState({
        phase: "preview",
        preview: data.preview,
        sheetName: data.sheetName,
        month: data.month,
        year: data.year,
        availableSheets: data.availableSheets,
      });
    }
  }, [personId]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setState({ phase: "error", message: "Only .xlsx and .xls files are supported." });
      return;
    }
    await parseFile(file);
  }, [parseFile]);

  async function handleConfirm() {
    if (state.phase !== "preview") return;
    const file = currentFileRef.current;
    if (!file) return;

    setState({ phase: "importing" });

    const fd = new FormData();
    fd.set("file", file);
    fd.set("personId", personId);
    fd.set("confirmed", "true");

    const result = await importTransactions(fd);

    if (!result.success) {
      const msg = result.errors._form?.[0] ?? "Import failed";
      setState({ phase: "error", message: msg });
      return;
    }

    const data = result.data as ImportResult;
    if ("importedCount" in data) {
      setState({ phase: "success", result: data });
      onImportComplete?.();
    }
  }

  function reset() {
    setState({ phase: "idle" });
    if (fileRef.current) fileRef.current.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (state.phase === "success" && "result" in state) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-6 h-6 text-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Import complete — {state.result.importedCount} transactions added
            {state.result.replaced && " (replaced existing data)"}
          </p>
        </div>
        <button
          onClick={reset}
          className="text-sm text-accent hover:underline"
        >
          Import another file
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleInputChange}
        />

        {state.phase === "parsing" || state.phase === "importing" ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {state.phase === "parsing" ? "Parsing file..." : "Importing transactions..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Drop an Excel file here or click to browse
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              .xlsx or .xls only
            </p>
          </div>
        )}
      </div>

      {state.phase === "error" && "message" in state && (
        <div className="mt-3 rounded-lg border border-negative/20 bg-negative/5 p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-negative shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-negative">{state.message}</p>
            </div>
            <button onClick={reset} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">Dismiss</button>
          </div>
        </div>
      )}

      {state.phase === "preview" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={reset}>
          <div
            className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Preview — {state.sheetName}
              </h3>
              <button onClick={reset} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {"availableSheets" in state && state.availableSheets.length > 1 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Sheet
                </label>
                <select
                  value={state.sheetName}
                  onChange={(e) => {
                    const file = currentFileRef.current;
                    if (file) parseFile(file, e.target.value);
                  }}
                  className="w-full border border-zinc-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                >
                  {state.availableSheets.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              {state.preview.length} transaction{state.preview.length !== 1 ? "s" : ""} found
              {state.preview.filter((t) => t.type === "credit").length > 0 && (
                <> — <span className="text-positive font-medium">{state.preview.filter((t) => t.type === "credit").length} credits</span></>
              )}
              {state.preview.filter((t) => t.type === "debit").length > 0 && (
                <> — <span className="text-negative font-medium">{state.preview.filter((t) => t.type === "debit").length} debits</span></>
              )}
            </p>

            <div className="flex-1 overflow-y-auto space-y-1 mb-4">
              {state.preview.slice(0, 100).map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-700/50 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 px-1.5 py-0.5 text-xs font-medium rounded ${
                      tx.type === "credit"
                        ? "bg-positive/10 text-positive"
                        : "bg-negative/10 text-negative"
                    }`}>
                      {tx.type === "credit" ? "C" : "D"}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400 tabular-nums">{tx.date}</span>
                    {tx.notes && (
                      <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">{tx.notes}</span>
                    )}
                  </div>
                  <span className={`font-medium tabular-nums ${
                    tx.type === "credit" ? "text-positive" : "text-negative"
                  }`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
              {state.preview.length > 100 && (
                <p className="text-xs text-center text-zinc-400 py-2">
                  ...and {state.preview.length - 100} more
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4 dark:border-zinc-700">
              <button
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-zinc-600 border border-zinc-300 rounded transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Import {state.preview.length} Transaction{state.preview.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
