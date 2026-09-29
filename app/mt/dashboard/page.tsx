import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAMDashboardData, get12WeeksChartData } from "@/lib/queries";
import { getISOWeek } from "@/lib/period";
import { BezettingsgradChart } from "@/components/BezettingsgradChart";
import { BezoekenChart } from "@/components/BezoekenChart";
import { KlantenChart } from "@/components/KlantenChart";
import { AfsprakenChart } from "@/components/AfsprakenChart";
import { WeekcijferChart } from "@/components/WeekcijferChart";
import { FacturabeleDAgenChart } from "@/components/FacturabeleDAgenChart";
import { NieuweAfsprakenRamChart } from "@/components/NieuweAfsprakenRamChart";
import { NieuweDealRamChart } from "@/components/NieuweDealRamChart";

export default async function DashboardPage() {
  await requireAuth("MT");

  const currentWeek = getISOWeek();
  const data = await getAMDashboardData(currentWeek);
  const chartData = await get12WeeksChartData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif text-charcoal">KPI Overview</h2>
        <p className="text-text-muted mt-2">
          Week {String(currentWeek.week).padStart(2, "0")} / {currentWeek.year}
        </p>
      </div>

      {/* Charts - 12 Weeks */}
      <div className="grid grid-cols-2 gap-6">
        {/* Row 1: Bezettingsgraad + Factureerbare Dagen Table */}
        <div className="col-span-1">
          <BezettingsgradChart data={chartData} />
        </div>
        <div className="col-span-1 bg-surface rounded-lg border border-line p-6">
          <h3 className="text-lg font-bold text-charcoal mb-4">Factureerbare Dagen (Huidige Week)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 px-2 text-text-muted">Accountmanager</th>
                  <th className="text-right py-2 px-2 text-text-muted">Dagen</th>
                </tr>
              </thead>
              <tbody>
                {data.ams.map((am) => (
                  <tr key={am.id} className="border-b border-line hover:bg-bg-soft">
                    <td className="py-3 px-2 font-medium">{am.name}</td>
                    <td className="py-3 px-2 text-right">{Math.round(am.totalFactureerbar || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 2: Bezoeken + Klanten */}
        <BezoekenChart data={chartData} />
        <KlantenChart data={chartData} />

        {/* Row 3: Afspraken + Weekcijfer */}
        <AfsprakenChart data={chartData} />
        <WeekcijferChart data={chartData} />

        {/* Row 4: RAM Charts */}
        <NieuweAfsprakenRamChart data={chartData} />
        <NieuweDealRamChart data={chartData} />
      </div>

      {/* Team Totalen */}
      <div className="bg-surface rounded-lg border border-line p-6">
        <h3 className="text-lg font-bold text-charcoal mb-4">Team Totalen</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 px-2 text-text-muted">Team</th>
                <th className="text-center py-2 px-2 text-text-muted">Leden</th>
                <th className="text-right py-2 px-2 text-text-muted">Bezettingsgraad</th>
                <th className="text-right py-2 px-2 text-text-muted">Bezoeken</th>
                <th className="text-right py-2 px-2 text-text-muted">Afspraken</th>
                <th className="text-right py-2 px-2 text-text-muted">Deals</th>
              </tr>
            </thead>
            <tbody>
              {data.teamTotals.map((team) => (
                <tr key={team.teamName} className="border-b border-line hover:bg-bg-soft">
                  <td className="py-3 px-2 font-medium">{team.teamName}</td>
                  <td className="py-3 px-2 text-center">{team.memberCount}</td>
                  <td className="py-3 px-2 text-right">{team.avgBezettingsgraad}%</td>
                  <td className="py-3 px-2 text-right">{team.totalBezoeken}</td>
                  <td className="py-3 px-2 text-right">{team.totalAfspraken}</td>
                  <td className="py-3 px-2 text-right font-medium">{team.totalDeals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accountmanager Details */}
      <div className="bg-surface rounded-lg border border-line p-6">
        <h3 className="text-lg font-bold text-charcoal mb-4">Accountmanager Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 px-2 text-text-muted">Naam</th>
                <th className="text-left py-2 px-2 text-text-muted">Team</th>
                <th className="text-right py-2 px-2 text-text-muted">Bezettingsgraad</th>
                <th className="text-right py-2 px-2 text-text-muted">Factureerbare Dagen</th>
                <th className="text-right py-2 px-2 text-text-muted">Bezoeken</th>
                <th className="text-right py-2 px-2 text-text-muted">Afspraken</th>
                <th className="text-right py-2 px-2 text-text-muted">Deals</th>
                <th className="text-center py-2 px-2 text-text-muted">Weekcijfer</th>
              </tr>
            </thead>
            <tbody>
              {data.amStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-muted">
                    Nog geen rapporten ingediend voor deze week
                  </td>
                </tr>
              ) : (
                data.amStats.map((am) => (
                  <tr key={am.amId} className="border-b border-line hover:bg-bg-soft">
                    <td className="py-3 px-2 font-medium">{am.amName}</td>
                    <td className="py-3 px-2">{am.team?.name || "-"}</td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          am.bezettingsgraad >= 85
                            ? "bg-status-green bg-opacity-20 text-status-green"
                            : "bg-status-amber bg-opacity-20 text-status-amber"
                        }`}
                      >
                        {am.bezettingsgraad}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono">{am.totalFactureerbareDagen}</td>
                    <td className="py-3 px-2 text-right">{am.totalBezoeken}</td>
                    <td className="py-3 px-2 text-right">{am.totalAfspraken}</td>
                    <td className="py-3 px-2 text-right font-medium">{am.totalDeals}</td>
                    <td className="py-3 px-2 text-center font-bold">
                      {am.weekcijfer || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
