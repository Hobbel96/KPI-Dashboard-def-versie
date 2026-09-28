import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createKpiAction, updateKpiAction, deleteKpiAction } from "@/app/actions/kpi";
import { DeleteForm } from "@/components/DeleteForm";

export default async function KpiBeheerPage() {
  await requireAuth("MT");

  const kpis = await db.kpi.findMany({
    where: { actief: true },
    include: { team: true },
    orderBy: { volgorde: "asc" },
  });

  const teams = await db.team.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif text-charcoal">KPI Beheer</h2>
        <p className="text-text-muted mt-2">Beheer gedeelde KPI definities</p>
      </div>

      {/* Create KPI */}
      <div className="bg-surface rounded-lg border border-line p-6">
        <h3 className="text-lg font-bold text-charcoal mb-4">Nieuwe KPI</h3>
        <form action={createKpiAction} className="space-y-4">
          <input
            type="text"
            name="naam"
            placeholder="KPI naam"
            required
            className="w-full px-4 py-2 border border-line rounded"
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              name="teamId"
              className="px-4 py-2 border border-line rounded"
            >
              <option value="">Algemeen KPI</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="eenheid"
              placeholder="Eenheid (bijv. %)"
              className="px-4 py-2 border border-line rounded"
            />
            <input
              type="number"
              step="0.1"
              name="prognose"
              placeholder="Prognose"
              className="px-4 py-2 border border-line rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-orange text-white py-2 rounded hover:bg-brand-orange-dark"
          >
            + KPI toevoegen
          </button>
        </form>
      </div>

      {/* KPI List */}
      <div className="space-y-3">
        {kpis.length === 0 ? (
          <div className="bg-surface rounded-lg border border-line p-8 text-center text-text-muted">
            Nog geen KPI's aangemaakt
          </div>
        ) : (
          kpis.map((kpi) => (
            <div key={kpi.id} className="bg-surface rounded-lg border border-line p-4">
              <form action={updateKpiAction} className="space-y-3">
                <input type="hidden" name="id" value={kpi.id} />
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="naam"
                        defaultValue={kpi.naam}
                        className="flex-1 px-3 py-2 border border-line rounded font-medium"
                      />
                      {kpi.team && (
                        <span className="px-2 py-1 bg-brand-yellow bg-opacity-30 text-brand-orange text-xs font-medium rounded whitespace-nowrap">
                          {kpi.team.name}
                        </span>
                      )}
                      {!kpi.team && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded whitespace-nowrap">
                          Algemeen
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        name="teamId"
                        defaultValue={kpi.teamId || ""}
                        className="px-3 py-2 border border-line rounded text-sm"
                      >
                        <option value="">Algemeen KPI</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="eenheid"
                        placeholder="Eenheid"
                        defaultValue={kpi.eenheid || ""}
                        className="px-3 py-2 border border-line rounded text-sm"
                      />
                      <input
                        type="number"
                        step="0.1"
                        name="prognose"
                        placeholder="Prognose"
                        defaultValue={kpi.prognose || ""}
                        className="px-3 py-2 border border-line rounded text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-yellow text-charcoal rounded hover:bg-brand-yellow-light text-sm"
                    >
                      Opslaan
                    </button>
                    <DeleteForm
                      action={deleteKpiAction}
                      itemId={kpi.id}
                      itemName={kpi.naam}
                      itemLabel="KPI"
                      className="px-4 py-2 text-status-red hover:bg-red-50 rounded text-sm"
                      buttonText="Verwijderen"
                    />
                  </div>
                </div>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
