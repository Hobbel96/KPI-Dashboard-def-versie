import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getISOWeek } from "@/lib/period";
import { upsertPrognoseAction } from "@/app/actions/prognoses";

export default async function PrognósesPage() {
  await requireAuth("MT");

  const ams = await db.user.findMany({
    where: { role: "AM" },
    orderBy: { name: "asc" },
  });

  const currentWeek = getISOWeek();
  const nextWeeks = [
    { year: currentWeek.year, week: currentWeek.week + 1 },
    { year: currentWeek.year, week: currentWeek.week + 2 },
    { year: currentWeek.year, week: currentWeek.week + 3 },
    { year: currentWeek.year, week: currentWeek.week + 4 },
  ];

  const prognoses = await db.prognose.findMany({
    where: {
      isoYear: { in: nextWeeks.map((w) => w.year) },
      isoWeek: { in: nextWeeks.map((w) => w.week) },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif text-charcoal">Prognoses</h2>
        <p className="text-text-muted mt-2">Vul prognoses in voor komende weken (minimaal 1 week vooruit)</p>
      </div>

      {/* AM Selector */}
      <div className="bg-surface rounded-lg border border-line p-6">
        <h3 className="text-sm font-bold text-charcoal mb-4">Snel navigeren naar accountmanager:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {ams.map((am) => (
            <a
              key={am.id}
              href={`#am-${am.id}`}
              className="p-3 text-left rounded border border-line hover:border-brand-orange hover:bg-bg-soft transition"
            >
              <div className="font-medium text-charcoal text-sm">{am.name}</div>
              <div className="text-xs text-text-muted truncate">{am.email}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {ams.map((am) => (
          <div key={am.id} id={`am-${am.id}`} className="bg-surface rounded-lg border border-line p-6 scroll-mt-24">
            <div className="mb-6 pb-4 border-b border-line">
              <h3 className="text-lg font-bold text-charcoal">{am.name}</h3>
              <p className="text-sm text-text-muted mt-1">{am.email}</p>
            </div>

            <div className="space-y-4">
              {nextWeeks.map((week) => {
                const prognose = prognoses.find(
                  (p) => p.amId === am.id && p.isoYear === week.year && p.isoWeek === week.week
                );

                return (
                  <form
                    key={`${week.year}-W${week.week}`}
                    action={upsertPrognoseAction}
                    className="grid grid-cols-2 gap-4 p-4 bg-bg-soft rounded"
                  >
                    <h4 className="col-span-2 font-medium text-charcoal">
                      Week {String(week.week).padStart(2, "0")} / {week.year}
                    </h4>

                    <input type="hidden" name="amId" value={am.id} />
                    <input type="hidden" name="isoYear" value={week.year} />
                    <input type="hidden" name="isoWeek" value={week.week} />

                    {/* Shared fields */}
                    <input
                      type="number"
                      step="0.5"
                      name="weekcijfer"
                      placeholder="Weekcijfer"
                      defaultValue={prognose?.weekcijfer || ""}
                      className="px-3 py-2 border border-line rounded text-sm"
                    />
                    <input
                      type="number"
                      step="0.5"
                      name="werkdagen"
                      placeholder="Werkdagen"
                      defaultValue={prognose?.werkdagen || ""}
                      className="px-3 py-2 border border-line rounded text-sm"
                    />
                    <input
                      type="number"
                      step="0.5"
                      name="factureerbareDagen"
                      placeholder="Factureerbare dagen"
                      defaultValue={prognose?.factureerbareDagen || ""}
                      className="px-3 py-2 border border-line rounded text-sm"
                    />

                    {/* WAM fields */}
                    <input
                      type="number"
                      step="1"
                      name="bezoeken"
                      placeholder="Bezoeken"
                      defaultValue={prognose?.bezoeken || ""}
                      className="px-3 py-2 border border-line rounded text-sm"
                    />
                    <input
                      type="number"
                      step="1"
                      name="klanten"
                      placeholder="Klanten"
                      defaultValue={prognose?.klanten || ""}
                      className="px-3 py-2 border border-line rounded text-sm"
                    />
                    <input
                      type="number"
                      step="1"
                      name="afspraken"
                      placeholder="Afspraken"
                      defaultValue={prognose?.afspraken || ""}
                      className="px-3 py-2 border border-line rounded text-sm"
                    />

                    {/* RAM fields */}
                    <input
                      type="number"
                      step="1"
                      name="nieuweAfspraken"
                      placeholder="Nieuwe afspraken"
                      defaultValue={prognose?.nieuweAfspraken || ""}
                      className="px-3 py-2 border border-line rounded text-sm"
                    />
                    <input
                      type="number"
                      step="1"
                      name="deals"
                      placeholder="Deals"
                      defaultValue={prognose?.deals || ""}
                      className="px-3 py-2 border border-line rounded text-sm"
                    />

                    <button
                      type="submit"
                      className="col-span-2 bg-brand-orange text-white py-2 rounded text-sm hover:bg-brand-orange-dark"
                    >
                      Opslaan
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
