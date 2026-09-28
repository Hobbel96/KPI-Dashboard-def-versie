"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { submitReportAction, createKlantAction } from "@/app/actions/reports";

type Klant = {
  id: string;
  naam: string;
};

type OpdrachtStep1 = {
  id: string;
  klantId: string;
  klantNaam: string;
  rol: "WAM" | "RAM";
};

type OpdrachtEntry = OpdrachtStep1 & {
  werkdagen: number;
  factureerbareDagen: number;
  bezoeken?: number;
  klanten?: number;
  afspraken?: number;
  nieuweAfspraken?: number;
  deals?: number;
};

type WizardState = {
  step: 1 | 2 | 3;
  opdrachten: OpdrachtStep1[];
  entries: Record<string, Omit<OpdrachtEntry, "id" | "klantId" | "klantNaam" | "rol">>;
  weekcijfer: number | null;
  showSuccess: boolean;
};

interface RapportageWizardProps {
  user: User;
  currentWeek: { year: number; week: number };
  initialKlanten: Klant[];
}

export function RapportageWizard({ user, currentWeek, initialKlanten }: RapportageWizardProps) {
  const [klanten, setKlanten] = useState<Klant[]>(initialKlanten);
  const [state, setState] = useState<WizardState>({
    step: 1,
    opdrachten: [],
    entries: {},
    weekcijfer: null,
    showSuccess: false,
  });

  const [newOpdracht, setNewOpdracht] = useState<{
    klantId: string;
    rol: "WAM" | "RAM";
  }>({
    klantId: "",
    rol: "WAM",
  });

  const [showNewKlantForm, setShowNewKlantForm] = useState(false);
  const [newKlantName, setNewKlantName] = useState("");
  const [error, setError] = useState("");

  // Add new klant
  const addNewKlant = async () => {
    if (!newKlantName.trim()) return;
    setError("");

    try {
      const result = await createKlantAction(newKlantName);
      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.klant) {
        setKlanten([...klanten, result.klant]);
        setNewKlantName("");
        setShowNewKlantForm(false);
        setNewOpdracht({ ...newOpdracht, klantId: result.klant.id });
      }
    } catch (err: any) {
      setError(err.message || "Fout bij toevoegen klant");
    }
  };

  // Step 1: Add opdracht
  const addOpdracht = () => {
    if (!newOpdracht.klantId) {
      setError("Selecteer een klant");
      return;
    }

    if (state.opdrachten.length >= 5) {
      setError("Maximaal 5 opdrachten per week");
      return;
    }

    const selectedKlant = klanten.find((k) => k.id === newOpdracht.klantId);
    if (!selectedKlant) return;

    const opdracht: OpdrachtStep1 = {
      id: Math.random().toString(36),
      klantId: newOpdracht.klantId,
      klantNaam: selectedKlant.naam,
      rol: newOpdracht.rol,
    };

    setState({
      ...state,
      opdrachten: [...state.opdrachten, opdracht],
    });

    setNewOpdracht({ klantId: "", rol: "WAM" });
    setError("");
  };

  const removeOpdracht = (id: string) => {
    setState({
      ...state,
      opdrachten: state.opdrachten.filter((o) => o.id !== id),
      entries: Object.fromEntries(
        Object.entries(state.entries).filter(([key]) => key !== id)
      ),
    });
  };

  // Step 2: Update entry
  const updateEntry = (opdrachtId: string, field: string, value: any) => {
    setState({
      ...state,
      entries: {
        ...state.entries,
        [opdrachtId]: {
          ...state.entries[opdrachtId],
          [field]: value ? parseFloat(value) : undefined,
        },
      },
    });
  };

  const canGoToStep2 = state.opdrachten.length > 0;
  const canGoToStep3 = state.opdrachten.every((o) => state.entries[o.id]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => {
              if (num === 1) setState({ ...state, step: 1 });
              else if (num === 2 && canGoToStep2)
                setState({ ...state, step: 2 });
              else if (num === 3 && canGoToStep3)
                setState({ ...state, step: 3 });
            }}
            disabled={num === 2 && !canGoToStep2}
            className={`py-2 px-4 rounded font-medium ${
              state.step === num
                ? "bg-brand-orange text-white"
                : "bg-bg-soft text-charcoal disabled:opacity-50"
            }`}
          >
            Stap {num}
          </button>
        ))}
      </div>

      {/* STEP 1: Select Klanten */}
      {state.step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-charcoal">
            Stap 1: Selecteer Opdrachtgevers (max 5)
          </h3>

          <div className="bg-surface rounded-lg border border-line p-6 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={newOpdracht.klantId}
                onChange={(e) => {
                  setNewOpdracht({ ...newOpdracht, klantId: e.target.value });
                  setError("");
                }}
                className="col-span-2 px-4 py-2 border border-line rounded"
              >
                <option value="">-- Selecteer opdrachtgever --</option>
                {klanten.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.naam}
                  </option>
                ))}
              </select>

              <select
                value={newOpdracht.rol}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "WAM" || value === "RAM") {
                    setNewOpdracht({
                      ...newOpdracht,
                      rol: value,
                    });
                  }
                }}
                className="px-4 py-2 border border-line rounded"
              >
                <option value="WAM">WAM</option>
                <option value="RAM">RAM</option>
              </select>
            </div>

            {error && (
              <div className="p-2 bg-red-50 text-status-red text-sm rounded border border-status-red">
                {error}
              </div>
            )}

            <button
              onClick={addOpdracht}
              className="w-full bg-brand-orange text-white py-2 rounded hover:bg-brand-orange-dark"
            >
              + Toevoegen
            </button>

            {/* New Klant Form */}
            {showNewKlantForm ? (
              <div className="space-y-2 p-3 bg-bg-soft rounded border border-line">
                <label className="block text-sm font-medium text-charcoal">
                  Nieuwe opdrachtgever:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKlantName}
                    onChange={(e) => setNewKlantName(e.target.value)}
                    placeholder="Naam opdrachtgever"
                    className="flex-1 px-4 py-2 border border-line rounded"
                  />
                  <button
                    onClick={addNewKlant}
                    className="px-4 py-2 bg-brand-yellow text-charcoal rounded font-medium hover:bg-brand-yellow-light"
                  >
                    Voeg toe
                  </button>
                  <button
                    onClick={() => setShowNewKlantForm(false)}
                    className="px-4 py-2 border border-line rounded hover:bg-bg-soft"
                  >
                    Annuleer
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewKlantForm(true)}
                className="w-full text-brand-orange border border-brand-orange py-2 rounded hover:bg-brand-orange hover:text-white transition font-medium text-sm"
              >
                + Nieuwe opdrachtgever toevoegen
              </button>
            )}

            {state.opdrachten.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="font-medium text-charcoal">Geselecteerde opdrachtgevers:</h4>
                {state.opdrachten.map((o) => (
                  <div
                    key={o.id}
                    className="flex justify-between items-center p-3 bg-bg-soft rounded"
                  >
                    <div>
                      <span className="font-medium">{o.klantNaam}</span>
                      <span className="ml-3 text-xs bg-brand-orange text-white px-2 py-1 rounded">
                        {o.rol}
                      </span>
                    </div>
                    <button
                      onClick={() => removeOpdracht(o.id)}
                      className="text-status-red hover:underline text-sm"
                    >
                      Verwijderen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setState({ ...state, step: 2 })}
            disabled={!canGoToStep2}
            className="w-full bg-brand-orange text-white py-2 rounded disabled:opacity-50 hover:bg-brand-orange-dark"
          >
            Volgende: KPI's invullen →
          </button>
        </div>
      )}

      {/* STEP 2: KPI entries */}
      {state.step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-charcoal">
            Stap 2: KPI's per Opdrachtgever
          </h3>

          {state.opdrachten.map((opdracht) => {
            const entry = state.entries[opdracht.id] || {};
            const isWAM = opdracht.rol === "WAM";

            return (
              <div
                key={opdracht.id}
                className="bg-surface rounded-lg border border-line p-6"
              >
                <h4 className="font-bold text-charcoal mb-4">
                  {opdracht.klantNaam}{" "}
                  <span className="text-xs bg-brand-orange text-white px-2 py-1 rounded">
                    {opdracht.rol}
                  </span>
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Shared fields */}
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="Werkdagen"
                    value={entry.werkdagen || ""}
                    onChange={(e) =>
                      updateEntry(opdracht.id, "werkdagen", e.target.value)
                    }
                    className="px-4 py-2 border border-line rounded"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="Factureerbare dagen"
                    value={entry.factureerbareDagen || ""}
                    onChange={(e) =>
                      updateEntry(opdracht.id, "factureerbareDagen", e.target.value)
                    }
                    className="px-4 py-2 border border-line rounded"
                  />

                  {/* WAM-only fields */}
                  {isWAM && (
                    <>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Bezoeken"
                        value={entry.bezoeken || ""}
                        onChange={(e) =>
                          updateEntry(opdracht.id, "bezoeken", e.target.value)
                        }
                        className="px-4 py-2 border border-line rounded"
                      />
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Klanten"
                        value={entry.klanten || ""}
                        onChange={(e) =>
                          updateEntry(opdracht.id, "klanten", e.target.value)
                        }
                        className="px-4 py-2 border border-line rounded"
                      />
                    </>
                  )}

                  {/* Shared */}
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Afspraken"
                    value={entry.afspraken || ""}
                    onChange={(e) =>
                      updateEntry(opdracht.id, "afspraken", e.target.value)
                    }
                    className="px-4 py-2 border border-line rounded"
                  />

                  {/* RAM-only fields */}
                  {!isWAM && (
                    <>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Nieuwe afspraken"
                        value={entry.nieuweAfspraken || ""}
                        onChange={(e) =>
                          updateEntry(opdracht.id, "nieuweAfspraken", e.target.value)
                        }
                        className="px-4 py-2 border border-line rounded"
                      />
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Deals"
                        value={entry.deals || ""}
                        onChange={(e) =>
                          updateEntry(opdracht.id, "deals", e.target.value)
                        }
                        className="px-4 py-2 border border-line rounded"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex gap-2">
            <button
              onClick={() => setState({ ...state, step: 1 })}
              className="flex-1 border border-line text-charcoal py-2 rounded hover:bg-bg-soft"
            >
              ← Vorige
            </button>
            <button
              onClick={() => setState({ ...state, step: 3 })}
              disabled={!canGoToStep3}
              className="flex-1 bg-brand-orange text-white py-2 rounded disabled:opacity-50 hover:bg-brand-orange-dark"
            >
              Volgende: Weekcijfer →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Weekcijfer & Submit */}
      {state.step === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-charcoal">Stap 3: Weekcijfer</h3>

          <div className="bg-surface rounded-lg border border-line p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Gemiddeld weekcijfer (1-10)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={state.weekcijfer || ""}
                onChange={(e) =>
                  setState({
                    ...state,
                    weekcijfer: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-2 border border-line rounded"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const formData = new FormData();
                    const opdrachtenData = state.opdrachten.map((o) => ({
                      klantId: o.klantId,
                      rol: o.rol,
                    }));

                    formData.append("opdrachten", JSON.stringify(opdrachtenData));
                    formData.append(
                      "entries",
                      JSON.stringify(
                        Object.fromEntries(
                          Object.entries(state.entries).map(([k, v]) => [
                            state.opdrachten.find((o) => o.id === k)?.klantId || k,
                            v,
                          ])
                        )
                      )
                    );
                    formData.append("weekcijfer", state.weekcijfer?.toString() || "");
                    formData.append("status", "SUBMITTED");

                    await submitReportAction(formData);
                    setState({ ...state, showSuccess: true });
                  } catch (err) {
                    console.error("Error saving draft:", err);
                    alert("Fout bij opslaan: " + (err as any).message);
                  }
                }}
                className="w-full bg-brand-yellow text-charcoal py-3 rounded font-medium hover:bg-brand-yellow-light"
              >
                💾 Opslaan
              </button>
            </div>
          </div>

          <button
            onClick={() => setState({ ...state, step: 2 })}
            className="w-full border border-line text-charcoal py-2 rounded hover:bg-bg-soft"
          >
            ← Vorige
          </button>
        </div>
      )}

      {/* SUCCESS SCREEN */}
      {state.showSuccess && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-yellow to-brand-orange-light p-4">
          <div className="text-center max-w-md">
            {/* Decorative slingers */}
            <div className="mb-8 text-6xl">🎉 🎊 🎈</div>

            <h1 className="text-5xl font-bold font-serif text-charcoal mb-6">
              Bedankt!
            </h1>

            <p className="text-xl text-charcoal mb-4 leading-relaxed">
              Dank je wel voor het invullen van je rapport!<br/>
              <span className="text-2xl font-bold">Fijne dag gewenst! 😊</span>
            </p>

            <p className="text-sm text-charcoal mb-8 opacity-80">
              Als je nog aanpassingen wil doen kun je het opnieuw invullen.<br/>
              De laatste versie wordt bewaard.
            </p>

            {/* Decorative elements */}
            <div className="flex justify-center gap-4 mb-12 text-5xl">
              <span>🎈</span>
              <span>✨</span>
              <span>🎊</span>
              <span>✨</span>
              <span>🎈</span>
            </div>

            <button
              onClick={() => setState({
                step: 1,
                opdrachten: [],
                entries: {},
                weekcijfer: null,
                showSuccess: false
              })}
              className="bg-charcoal text-white px-8 py-3 rounded-lg font-bold hover:bg-charcoal-dark transition"
            >
              ← Terug naar start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
