"use client";

import { useState } from "react";
import { downloadTemplate } from "@/src/server/actions/download-template";

interface TemplateDownloadProps {
  className?: string;
  label?: string;
}

export default function TemplateDownload({ className = "", label = "Download Ledger Template" }: TemplateDownloadProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const result = await downloadTemplate();
      if (!result.success) return;
      const { data, filename } = result.data;
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`px-4 py-2 bg-accent text-white text-sm font-medium rounded transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 ${className}`}
    >
      {loading ? "Generating..." : label}
    </button>
  );
}
