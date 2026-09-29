import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createMtOnlyKpiAction,
  updateMtOnlyKpiAction,
  deleteMtOnlyKpiAction,
} from "@/app/actions/mtOnlyKpi";
import { DeleteForm } from "@/components/DeleteForm";

export default async function MtOnlyKpisPage() {
  await requireAuth("MT");

  const mtOnlyKpis = await db.mtOnlyKpi.findMany({
    where: { actief: true },
    orderBy: { volgorde: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif text-charcoal">MT KPI's</h2>
        <p className="text-text-muted mt-2">Beheer MT-only KPI definities</p>
      </div>

      {/* Create KPI */}
      <div className="bg-surface rounded-lg border border-line p-6">
        <h3 className="text-lg font-bold text-charcoal mb-4">Nieuwe KPI</h3>
        <form action={createMtOnlyKpiAction} className="space-y-4">
          <input
            type="text"
            name="naam"
            placeholder="KPI naam"
            required
            className="w-full px-4 py-2 border border-line rounded"
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="eenheid"
              placeholder="Eenheid (bijv. €, stuks, %)"
              className="flex-1 px-4 py-2 border border-line rounded"
            />
            <button
              type="submit"
              className="bg-brand-orange text-white px-6 py-2 rounded hover:bg-brand-orange-dark"
            >
              + KPI toevoegen
            </button>
          </div>
        </form>
      </div>

      {/* KPI List */}
      <div className="space-y-3">
        {mtOnlyKpis.length === 0 ? (
          <div className="bg-surface rounded-lg border border-line p-8 text-center text-text-muted">
            Nog geen KPI's aangemaakt
          </div>
        ) : (
          mtOnlyKpis.map((kpi) => (
            <div key={kpi.id} className="bg-surface rounded-lg border border-line p-4">
              <form action={updateMtOnlyKpiAction} className="space-y-3">
                <input type="hidden" name="id" value={kpi.id} />
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      name="naam"
                      defaultValue={kpi.naam}
                      className="w-full px-3 py-2 border border-line rounded font-medium"
                    />
                    <input
                      type="text"
                      name="eenheid"
                      placeholder="Eenheid"
                      defaultValue={kpi.eenheid || ""}
                      className="w-full px-3 py-2 border border-line rounded text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-yellow text-charcoal rounded hover:bg-brand-yellow-light text-sm"
                    >
                      Opslaan
                    </button>
                    <DeleteForm
                      action={deleteMtOnlyKpiAction}
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
