import { db } from "./db";
import { getISOWeek, weekKey } from "./period";

const klantenRealisatieData = {
  16: 20, 17: 19, 18: 21, 19: 32, 20: 24, 21: 10, 22: 25, 23: 24,
  24: 20, 25: 15, 26: 24, 27: 21, 28: 21, 29: 14, 30: 21, 31: 19,
  32: 22, 33: 19, 34: 7, 35: 22, 36: 25, 37: 37, 38: 28,
};

const klantenPrognosisData = {
  16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0,
  24: 10, 25: 16, 26: 16, 27: 21.5, 28: 23.5, 29: 15.5, 30: 15, 31: 19,
  32: 18, 33: 15.5, 34: 18.5, 35: 19.5, 36: 23.5, 37: 32.5, 38: 28.5,
};

const bezoekenRealisatieData = {
  16: 96, 17: 114, 18: 147, 19: 149, 20: 125, 21: 74, 22: 138, 23: 165,
  24: 162, 25: 130, 26: 109, 27: 142, 28: 176, 29: 98, 30: 129, 31: 155,
  32: 187, 33: 112, 34: 38, 35: 160, 36: 152, 37: 148, 38: 216,
};

const bezoekenPrognosisData = {
  16: 0, 17: 108, 18: 40, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0,
  24: 80, 25: 128, 26: 128, 27: 156, 28: 188, 29: 124, 30: 120, 31: 152,
  32: 144, 33: 124, 34: 106, 35: 160, 36: 188, 37: 260, 38: 228,
};

const afsprakenRealisatieData = {
  16: 25, 17: 21, 18: 14, 19: 29, 20: 24, 21: 19, 22: 26, 23: 18,
  24: 38, 25: 29, 26: 22, 27: 31, 28: 25, 29: 19, 30: 25, 31: 36,
  32: 35, 33: 16, 34: 6, 35: 29, 36: 20, 37: 42, 38: 28,
};

const afsprakenPrognosisData = {
  16: 0, 17: 13, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0,
  24: 20, 25: 32, 26: 32, 27: 39, 28: 47, 29: 31, 30: 30, 31: 38,
  32: 36, 33: 31, 34: 79, 35: 39, 36: 47, 37: 65, 38: 57,
};

const nieuweAfsprakenRamRealisatieData = {
  16: 1, 17: 10, 18: 5, 19: 6, 20: 4, 21: 6, 22: 1, 23: 4,
  24: 9, 25: 3, 26: 4, 27: 5, 28: 5, 29: 8, 30: 2, 31: 4,
  32: 2, 34: 2, 35: 3, 36: 2,
};

const nieuweAfsprakenRamPrognosisData = {
  16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0,
  24: 0, 25: 2.5, 26: 4.81, 27: 6.16, 28: 6.16, 29: 6.16, 30: 5.31, 31: 6.16,
  32: 2, 33: 2.7, 34: 3.36, 35: 4.83, 36: 4.33, 37: 4.33, 38: 4.33,
  40: 2.5,
};

const nieuweDealRamRealisatieData = {
  17: 1, 18: 1, 19: 1, 21: 1, 22: 3, 23: 3, 25: 1, 26: 1,
  27: 1, 28: 2, 29: 3, 31: 1, 34: 2, 36: 1, 37: 1, 38: 1,
};

const nieuweDealRamPrognosisData = {
  16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0,
  24: 0, 25: 2.5, 26: 4.81, 27: 6.16, 28: 6.16, 29: 6.16, 30: 5.31, 31: 6.16,
  32: 2, 33: 2.7, 34: 3.36, 35: 4.83, 36: 4.33, 37: 4.33, 38: 4.33,
  40: 2.5,
};

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
    const hardcodedBezoekenPrognose = bezoekenPrognosisData[w.week as keyof typeof bezoekenPrognosisData];
    const prognoseBezoeken = hardcodedBezoekenPrognose !== undefined
      ? hardcodedBezoekenPrognose
      : weekPrognoses.reduce(
          (sum, p) => sum + (p.bezoeken || 0),
          0
        );

    const hardcodedBezoekenRealisatie = bezoekenRealisatieData[w.week as keyof typeof bezoekenRealisatieData];
    const mtBezoekenRealisatie = weekPrognoses.reduce(
      (sum, p) => sum + (p.bezoekenRealisatie || 0),
      0
    );
    const realisatieBezoeken = hardcodedBezoekenRealisatie
      ? hardcodedBezoekenRealisatie
      : mtBezoekenRealisatie > 0
      ? mtBezoekenRealisatie
      : weekReports.reduce(
          (sum, r) =>
            sum +
            r.entries.reduce((s, e) => s + (e.bezoeken || 0), 0),
          0
        );

    // Klanten
    const hardcodedKlantenPrognose = klantenPrognosisData[w.week as keyof typeof klantenPrognosisData];
    const prognoseKlanten = hardcodedKlantenPrognose !== undefined
      ? hardcodedKlantenPrognose
      : weekPrognoses.reduce(
          (sum, p) => sum + (p.klanten || 0),
          0
        );

    const hardcodedKlantenRealisatie = klantenRealisatieData[w.week as keyof typeof klantenRealisatieData];
    const mtKlantenRealisatie = weekPrognoses.reduce(
      (sum, p) => sum + (p.klantenRealisatie || 0),
      0
    );

    const realisatieKlanten = hardcodedKlantenRealisatie
      ? hardcodedKlantenRealisatie
      : mtKlantenRealisatie > 0
      ? mtKlantenRealisatie
      : weekReports.reduce(
          (sum, r) =>
            sum +
            r.entries.reduce((s, e) => s + (e.klanten || 0), 0),
          0
        );

    // Afspraken
    const hardcodedAfsprakenPrognose = afsprakenPrognosisData[w.week as keyof typeof afsprakenPrognosisData];
    const prognoseAfspraken = hardcodedAfsprakenPrognose !== undefined
      ? hardcodedAfsprakenPrognose
      : weekPrognoses.reduce(
          (sum, p) => sum + (p.afspraken || 0),
          0
        );

    const hardcodedAfsprakenRealisatie = afsprakenRealisatieData[w.week as keyof typeof afsprakenRealisatieData];
    const mtAfsprakenRealisatie = weekPrognoses.reduce(
      (sum, p) => sum + (p.afsprakenRealisatie || 0),
      0
    );
    const realisatieAfspraken = hardcodedAfsprakenRealisatie
      ? hardcodedAfsprakenRealisatie
      : mtAfsprakenRealisatie > 0
      ? mtAfsprakenRealisatie
      : weekReports.reduce(
          (sum, r) =>
            sum +
            r.entries.reduce((s, e) => s + (e.afspraken || 0), 0),
          0
        );

    // Weekcijfer (MT realisatie leidend)
    const mtWeekcijfersRealisatie = weekPrognoses
      .map((p) => p.weekcijferRealisatie)
      .filter((wc) => wc !== null && wc !== undefined) as number[];

    const weekcijfersRealisatie = mtWeekcijfersRealisatie.length > 0
      ? mtWeekcijfersRealisatie
      : weekReports
          .map((r) => r.weekcijfer)
          .filter((wc) => wc !== null && wc !== undefined) as number[];

    const gemiddeldWeekcijfer = weekcijfersRealisatie.length > 0
      ? Math.round(
          (weekcijfersRealisatie.reduce((sum, wc) => sum + wc, 0) / weekcijfersRealisatie.length) * 10
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

    // Nieuwe afspraken RAM
    const hardcodedNieuweAfsprakenRamPrognose = nieuweAfsprakenRamPrognosisData[w.week as keyof typeof nieuweAfsprakenRamPrognosisData];
    const prognoseNieuweAfsprakenRam = hardcodedNieuweAfsprakenRamPrognose !== undefined
      ? hardcodedNieuweAfsprakenRamPrognose
      : weekPrognoses.reduce(
          (sum, p) => sum + (p.nieuweAfspraken || 0),
          0
        );

    const hardcodedNieuweAfsprakenRamRealisatie = nieuweAfsprakenRamRealisatieData[w.week as keyof typeof nieuweAfsprakenRamRealisatieData];
    const mtNieuweAfsprakenRamRealisatie = weekPrognoses.reduce(
      (sum, p) => sum + (p.nieuweAfsprakenRealisatie || 0),
      0
    );
    const realisatieNieuweAfsprakenRam = hardcodedNieuweAfsprakenRamRealisatie
      ? hardcodedNieuweAfsprakenRamRealisatie
      : mtNieuweAfsprakenRamRealisatie > 0
      ? mtNieuweAfsprakenRamRealisatie
      : 0;

    // Nieuwe deals RAM
    const hardcodedNieuweDealRamPrognose = nieuweDealRamPrognosisData[w.week as keyof typeof nieuweDealRamPrognosisData];
    const prognoseNieuweDealRam = hardcodedNieuweDealRamPrognose !== undefined
      ? hardcodedNieuweDealRamPrognose
      : weekPrognoses.reduce(
          (sum, p) => sum + (p.deals || 0),
          0
        );

    const hardcodedNieuweDealRamRealisatie = nieuweDealRamRealisatieData[w.week as keyof typeof nieuweDealRamRealisatieData];
    const mtNieuweDealRamRealisatie = weekPrognoses.reduce(
      (sum, p) => sum + (p.dealsRealisatie || 0),
      0
    );
    const realisatieNieuweDealRam = hardcodedNieuweDealRamRealisatie
      ? hardcodedNieuweDealRamRealisatie
      : mtNieuweDealRamRealisatie > 0
      ? mtNieuweDealRamRealisatie
      : 0;

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
      nieuwe_afspraken_ram_prognose: prognoseNieuweAfsprakenRam,
      nieuwe_afspraken_ram_realisatie: realisatieNieuweAfsprakenRam,
      nieuwe_deals_ram_prognose: prognoseNieuweDealRam,
      nieuwe_deals_ram_realisatie: realisatieNieuweDealRam,
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
