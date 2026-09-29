import { db } from "./db";
import { getISOWeek, weekKey } from "./period";

export async function get12WeeksChartData() {
  const weeks = [];

  // Generate weeks 15-49, excluding week 22 and weeks 43+
  const year = new Date().getFullYear();
  for (let week = 15; week <= 49; week++) {
    if (week === 22 || week >= 43) continue;
    weeks.push({ year, week });
  }

  // Get all reports for these weeks
  const reports = await db.weeklyReport.findMany({
    where: {
      OR: weeks.map((w) => ({
        isoYear: w.year,
        isoWeek: w.week,
        status: "SUBMITTED",
      })),
    },
    include: {
      am: true,
      entries: true,
    },
  });

  // Get all prognoses for these weeks
  const prognoses = await db.prognose.findMany({
    where: {
      OR: weeks.map((w) => ({
        isoYear: w.year,
        isoWeek: w.week,
      })),
    },
    include: { am: true },
  });

  // Organize by week
  const chartData = weeks.map((w) => {
    const weekReports = reports.filter(
      (r) => r.isoYear === w.year && r.isoWeek === w.week
    );

    const weekPrognoses = prognoses.filter(
      (p) => p.isoYear === w.year && p.isoWeek === w.week
    );

    // Bezettingsgraad
    const totalFactureerbar = weekReports.reduce(
      (sum, r) =>
        sum +
        r.entries.reduce((s, e) => s + (e.factureerbareDagen || 0), 0),
      0
    );

    const totalAvailable = weekReports.reduce(
      (sum, r) => sum + (r.am.availableDaysPerWeek || 0),
      0
    );

    const prognoseBezetting = 95;

    // Check if we have a direct bezettingsgraad percentage from KPI Dashboard
    const kpiDashboardBezetting = weekPrognoses.find(
      (p) => p.bezettingsgradRealisatiePercentage !== null
    );

    const realisatieBezetting = kpiDashboardBezetting
      ? kpiDashboardBezetting.bezettingsgradRealisatiePercentage
      : weekReports.length > 0
      ? Math.round(
          ((totalFactureerbar || 0) / (totalAvailable || 1)) * 100 * 10
        ) / 10
      : 0;

    // Bezoeken
    const prognoseBezoeken = weekPrognoses.reduce(
      (sum, p) => sum + (p.bezoeken || 0),
      0
    );

    const mtBezoekenData = weekPrognoses.reduce(
      (sum, p) => sum + (p.bezoeken || 0),
      0
    );
    const realisatieBezoeken = mtBezoekenData > 0
      ? mtBezoekenData
      : weekReports.reduce(
          (sum, r) =>
            sum +
            r.entries.reduce((s, e) => s + (e.bezoeken || 0), 0),
          0
        );

    // Klanten
    const prognoseKlanten = weekPrognoses.reduce(
      (sum, p) => sum + (p.klanten || 0),
      0
    );

    const mtKlantenData = weekPrognoses.reduce(
      (sum, p) => sum + (p.klanten || 0),
      0
    );
    const realisatieKlanten = mtKlantenData > 0
      ? mtKlantenData
      : weekReports.reduce(
          (sum, r) =>
            sum +
            r.entries.reduce((s, e) => s + (e.klanten || 0), 0),
          0
        );

    // Afspraken
    const prognoseAfspraken = weekPrognoses.reduce(
      (sum, p) => sum + (p.afspraken || 0),
      0
    );

    const mtAfsprakenData = weekPrognoses.reduce(
      (sum, p) => sum + (p.afspraken || 0),
      0
    );
    const realisatieAfspraken = mtAfsprakenData > 0
      ? mtAfsprakenData
      : weekReports.reduce(
          (sum, r) =>
            sum +
            r.entries.reduce((s, e) => s + (e.afspraken || 0), 0),
          0
        );

    // Weekcijfer (MT leidend)
    const mtWeekcijfers = weekPrognoses
      .map((p) => p.weekcijfer)
      .filter((wc) => wc !== null && wc !== undefined) as number[];

    const weekcijfers = mtWeekcijfers.length > 0
      ? mtWeekcijfers
      : weekReports
          .map((r) => r.weekcijfer)
          .filter((wc) => wc !== null && wc !== undefined) as number[];

    const gemiddeldWeekcijfer = weekcijfers.length > 0
      ? Math.round(
          (weekcijfers.reduce((sum, wc) => sum + wc, 0) / weekcijfers.length) * 10
        ) / 10
      : 0;

    // Factureerbare Dagen
    const kpiDashboardFactureerbareDagen = weekPrognoses.find(
      (p) => p.factureerbareDagenRealisatie !== null
    );

    const totalFactureerbareDagen = kpiDashboardFactureerbareDagen
      ? kpiDashboardFactureerbareDagen.factureerbareDagenRealisatie
      : weekReports.reduce(
          (sum, r) =>
            sum +
            r.entries.reduce((s, e) => s + (e.factureerbareDagen || 0), 0),
          0
        );

    return {
      week: `W${String(w.week).padStart(2, "0")}`,
      weekNum: w.week,
      year: w.year,
      bezetting_prognose: prognoseBezetting,
      bezetting_realisatie: realisatieBezetting,
      bezoeken_prognose: prognoseBezoeken,
      bezoeken_realisatie: realisatieBezoeken,
      klanten_prognose: prognoseKlanten,
      klanten_realisatie: realisatieKlanten,
      afspraken_prognose: prognoseAfspraken,
      afspraken_realisatie: realisatieAfspraken,
      weekcijfer_prognose: 7,
      weekcijfer: gemiddeldWeekcijfer,
      factureerbare_prognose: 45,
      factureerbare_dagen: totalFactureerbareDagen || 0,
    };
  });

  return chartData;
}

export async function getAMDashboardData(week?: { year: number; week: number }) {
  const queryWeek = week || getISOWeek();

  // Get all weekly reports for this week
  const reports = await db.weeklyReport.findMany({
    where: {
      isoYear: queryWeek.year,
      isoWeek: queryWeek.week,
      status: "SUBMITTED",
    },
    include: {
      am: { include: { team: true } },
      entries: {
        include: { opdracht: true },
      },
    },
  });

  // Calculate KPIs per AM
  const amStats = await Promise.all(
    reports.map(async (report) => {
      const totalFactureerbareDagen = report.entries.reduce(
        (sum, e) => sum + (e.factureerbareDagen || 0),
        0
      );

      const totalBezoeken = report.entries
        .filter((e) => e.bezoeken !== null)
        .reduce((sum, e) => sum + (e.bezoeken || 0), 0);

      const totalAfspraken = report.entries
        .filter((e) => e.afspraken !== null)
        .reduce((sum, e) => sum + (e.afspraken || 0), 0);

      const totalDeals = report.entries
        .filter((e) => e.deals !== null)
        .reduce((sum, e) => sum + (e.deals || 0), 0);

      // Bezettingsgraad = (Factureerbare ÷ Beschikbare) × 100%
      const bezettingsgraad =
        report.am.availableDaysPerWeek && report.am.availableDaysPerWeek > 0
          ? (totalFactureerbareDagen / report.am.availableDaysPerWeek) * 100
          : 0;

      return {
        amId: report.am.id,
        amName: report.am.name,
        team: report.am.team,
        bezettingsgraad: Math.round(bezettingsgraad * 10) / 10,
        totalFactureerbareDagen,
        totalBezoeken,
        totalAfspraken,
        totalDeals,
        weekcijfer: report.weekcijfer,
      };
    })
  );

  // Group by team for Team Totalen
  const teamStats = new Map<string, (typeof amStats)[0][]>();
  amStats.forEach((stat) => {
    const teamName = stat.team?.name || "Zonder team";
    if (!teamStats.has(teamName)) {
      teamStats.set(teamName, []);
    }
    teamStats.get(teamName)!.push(stat);
  });

  const teamTotals = Array.from(teamStats.entries()).map(([teamName, members]) => ({
    teamName,
    memberCount: members.length,
    totalBezoeken: members.reduce((sum, m) => sum + m.totalBezoeken, 0),
    totalAfspraken: members.reduce((sum, m) => sum + m.totalAfspraken, 0),
    totalDeals: members.reduce((sum, m) => sum + m.totalDeals, 0),
    avgBezettingsgraad:
      Math.round(
        (members.reduce((sum, m) => sum + m.bezettingsgraad, 0) / members.length) *
          10
      ) / 10,
  }));

  // Calculate summary stats
  const totalBezoeken = amStats.reduce((sum, s) => sum + s.totalBezoeken, 0);
  const avgWeekcijfer =
    amStats.length > 0
      ? Math.round(
          (amStats
            .filter((s) => s.weekcijfer !== null)
            .reduce((sum, s) => sum + (s.weekcijfer || 0), 0) /
            amStats.filter((s) => s.weekcijfer !== null).length) *
            10
        ) / 10
      : 0;

  const avgBezettingsgraad =
    amStats.length > 0
      ? Math.round(
          (amStats.reduce((sum, s) => sum + s.bezettingsgraad, 0) / amStats.length) *
            10
        ) / 10
      : 0;

  return {
    week: queryWeek,
    amStats,
    teamTotals,
    summary: {
      totalBezoeken,
      avgWeekcijfer,
      avgBezettingsgraad,
      totalDealsPipeline: amStats.reduce((sum, s) => sum + s.totalDeals, 0),
    },
  };
}

export async function getPrognoseComparison(amId: string, week?: { year: number; week: number }) {
  const queryWeek = week || getISOWeek();

  const realisatie = await db.weeklyReport.findFirst({
    where: {
      amId,
      isoYear: queryWeek.year,
      isoWeek: queryWeek.week,
    },
    include: { entries: true },
  });

  const prognose = await db.prognose.findFirst({
    where: {
      amId,
      isoYear: queryWeek.year,
      isoWeek: queryWeek.week,
    },
  });

  return { realisatie, prognose };
}
