"use client";

import { useState, useCallback } from "react";
import ImportTransactions from "@/app/_components/import-transactions";
import PersonSummaryView from "@/app/_components/person-summary";

export default function SummaryClient({ personId }: { personId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <div className="mb-6">
        <ImportTransactions personId={personId} onImportComplete={handleImportComplete} />
      </div>
      <PersonSummaryView personId={personId} refreshKey={refreshKey} />
    </>
  );
}
