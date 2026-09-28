import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createMtOnlyKpiAction,
  upsertMtOnlyKpiValueAction,
  deleteMtOnlyKpiAction,
} from "@/app/actions/mtOnlyKpi";
import { DeleteForm } from "@/components/DeleteForm";

export default async function MtOnlyKpisPage() {
  await requireAuth("MT");

  const mtOnlyKpis = await db.mtOnlyKpi.findMany({
    where: { actief: true },
    include: { waarden: true },
    orderBy: { volgorde: "asc" },
  });

  // Default MT-only KPI's
  const defaultKpis = [
    { naam: "Kwartaaldoel", eenheid: "€" },
    { naam: "Contactmomenten Opdrachtgevers", eenheid: "stuks" },
    { naam: "Nieuwe C.V.'s", eenheid: "stuks" },
    { naam: "Openstaand Bedrag Facturen", eenheid: "€" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif text-charcoal">MT-Only KPI's</h2>
        <p className="text-text-muted mt-2">Alleen zichtbaar voor management</p>
      </div>

      {/* Create Default KPI's if none exist */}
      {mtOnlyKpis.length === 0 && (
        <div className="bg-brand-yellow bg-opacity-20 border border-brand-yellow rounded p-4">
          <p className="text-sm text-charcoal mb-3">Standaard KPI's hebben nog niet bestaan. Maak ze aan:</p>
          <div className="space-y-2">
            {defaultKpis.map((kpi) => (
              <form key={kpi.naam} action={createMtOnlyKpiAction} className="inline">
                <input type="hidden" name="naam" value={kpi.naam} />
                <input type="hidden" name="eenheid" value={kpi.eenheid} />
                <button
                  type="submit"
                  className="text-sm text-brand-orange hover:underline"
                >
                  + {kpi.naam}
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* MT-Only KPI's List */}
      <div className="space-y-6">
        {mtOnlyKpis.map((kpi) => (
          <div key={kpi.id} className="bg-surface rounded-lg border border-line p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-charcoal">{kpi.naam}</h3>
                {kpi.eenheid && <p className="text-sm text-text-muted">Eenheid: {kpi.eenheid}</p>}
              </div>
              <DeleteForm
                action={deleteMtOnlyKpiAction}
                itemId={kpi.id}
                itemName={kpi.naam}
                itemLabel="KPI"
              />
            </div>

            {/* Current Value */}
            <form action={upsertMtOnlyKpiValueAction} className="space-y-3">
              <input type="hidden" name="mtOnlyKpiId" value={kpi.id} />
              <input
                type="hidden"
                name="periodKey"
                value={new Date().getFullYear() + "-Q" + Math.ceil((new Date().getMonth() + 1) / 3)}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  name="waarde"
                  placeholder="Waarde"
                  defaultValue={
                    kpi.waarden[kpi.waarden.length - 1]?.waarde?.toString() || ""
                  }
                  className="flex-1 px-4 py-2 border border-line rounded"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange-dark"
                >
                  Opslaan
                </button>
              </div>
            </form>

            {/* History */}
            {kpi.waarden.length > 0 && (
              <div className="mt-4 pt-4 border-t border-line">
                <p className="text-xs text-text-muted mb-2">Geschiedenis:</p>
                <div className="space-y-1">
                  {kpi.waarden.slice(-5).map((val) => (
                    <div key={val.id} className="text-xs flex justify-between text-text-muted">
                      <span>{val.periodKey}</span>
                      <span className="font-mono">{val.waarde}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
