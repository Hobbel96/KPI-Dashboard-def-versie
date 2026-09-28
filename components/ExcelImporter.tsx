"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importBezettingsgradAction } from "@/app/actions/import";
import { User } from "@prisma/client";

interface ExcelImporterProps {
  users: User[];
}

export function ExcelImporter({ users }: ExcelImporterProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"prognose" | "realisatie">("prognose");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Selecteer een bestand" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("amIdOrTeam", "all");

      const result = await importBezettingsgradAction(formData);
      setMessage({ type: "success", text: `✓ ${result.rowsProcessed} weken geïmporteerd (voor alle AMs)` });
      setFile(null);

      // Refresh the page to show updated charts
      setTimeout(() => router.refresh(), 500);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Import mislukt" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-6 mb-6">
      <h3 className="text-lg font-bold text-charcoal mb-4">Excel Import - Bezettingsgraad</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Excel File (Bezettingsgraad rij)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-line rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "prognose" | "realisatie")}
            className="w-full px-4 py-2 border border-line rounded"
          >
            <option value="prognose">Doelstelling (Prognose) - alle AMs</option>
            <option value="realisatie">Realisatie (WeeklyReport) - alle AMs</option>
          </select>
        </div>

        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.type === "success"
                ? "bg-green-50 text-status-green border border-status-green"
                : "bg-red-50 text-status-red border border-status-red"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-brand-orange text-white py-2 rounded disabled:opacity-50 hover:bg-brand-orange-dark"
        >
          {loading ? "Bezig..." : "Importeren voor alle AMs"}
        </button>
      </form>
    </div>
  );
}
