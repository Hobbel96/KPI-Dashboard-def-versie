import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RapportageWizard } from "@/components/am/RapportageWizard";
import { getISOWeek } from "@/lib/period";

export default async function RapportagePage() {
  const user = await requireAuth("AM");
  const currentWeek = getISOWeek();

  const klanten = await db.klant.findMany({
    orderBy: { naam: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif text-charcoal">
          Wekelijks Rapport
        </h2>
        <p className="text-text-muted mt-2">
          Week {String(currentWeek.week).padStart(2, "0")} / {currentWeek.year}
        </p>
      </div>

      <RapportageWizard user={user} currentWeek={currentWeek} initialKlanten={klanten} />
    </div>
  );
}
