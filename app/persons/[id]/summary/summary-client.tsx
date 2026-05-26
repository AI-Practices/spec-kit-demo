"use client";

import { useState, useCallback } from "react";
import ImportTransactions from "@/app/_components/import-transactions";
import ExportButton from "@/app/_components/export-button";
import PersonSummaryView from "@/app/_components/person-summary";

export default function SummaryClient({ personId }: { personId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <div className="mb-6 space-y-4">
        <ImportTransactions personId={personId} onImportComplete={handleImportComplete} />
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Export ledger</h3>
          <ExportButton personId={personId} />
        </div>
      </div>
      <PersonSummaryView personId={personId} refreshKey={refreshKey} />
    </>
  );
}
