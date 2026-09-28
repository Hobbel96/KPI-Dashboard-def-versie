"use client";

import { useState } from "react";
import { importExcelAction } from "@/app/actions/excel-import";

export default function ExcelImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError("");
      setMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Selecteer een Excel bestand");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await importExcelAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setMessage(
          `✅ Succesvol geïmporteerd! ${result.imported} records ingeladen.`
        );
        setFile(null);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) input.value = "";
      }
    } catch (err: any) {
      setError(err.message || "Import mislukt");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif text-charcoal">
          Excel Import
        </h2>
        <p className="text-text-muted mt-2">
          Importeer historische KPI data uit Excel bestanden
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-line p-6">
        <h3 className="text-lg font-bold text-charcoal mb-4">Excel structuur</h3>
        <div className="space-y-3 text-sm text-text-muted">
          <p>
            <strong>Sheet naam:</strong> Voornaam van accountmanager (bijv. "David", "Erik")
          </p>
          <p>
            <strong>Kolommen:</strong> Week | Factureerbare Dagen | Bezoeken | Klanten | Afspraken
          </p>
          <p>
            <strong>Data:</strong> Per rij één week, gesorteerd op weeknummer (15-49)
          </p>
          <p className="text-xs bg-bg-soft p-3 rounded">
            Voorbeeld: Sheet "David" met kolommen: W16, 38, 5, 3, 8 | W17, 38, 6, 3, 10 | etc.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-lg border border-line p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Excel bestand
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-brand-orange"
            />
            {file && (
              <p className="text-sm text-text-muted mt-2">
                Geselecteerd: {file.name}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-status-red rounded text-status-red text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-status-green rounded text-status-green text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full bg-brand-orange text-white py-2 rounded-lg font-medium hover:bg-brand-orange-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Bezig met importeren..." : "Importeren"}
          </button>
        </div>
      </form>

      <div className="bg-bg-soft rounded-lg p-6">
        <h3 className="font-bold text-charcoal mb-3">ℹ️ Informatie</h3>
        <ul className="text-sm text-text-muted space-y-2 list-disc list-inside">
          <li>Per accountmanager een aparte sheet in hetzelfde Excel bestand</li>
          <li>Sheet naam moet beginnen met voornaam van AM (bijv. "David", "Erik")</li>
          <li>Weken kunnen van week 15 tot 49</li>
          <li>Bestaande data wordt vervangen</li>
          <li>Alle velden zijn optioneel behalve Week</li>
        </ul>
      </div>
    </div>
  );
}
