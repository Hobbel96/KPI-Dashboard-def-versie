const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

// Map periods to weeks
const periodWeeks = {
  6: [21, 22, 23, 24],
  7: [25, 26, 27, 28],
  8: [29, 30, 31, 32],
  9: [33, 34, 35, 36],
  10: [37, 38, 39, 40],
};

async function importPeriods() {
  console.log("📥 Importing P6-P10 data...\n");

  const downloadPath = "C:/Users/hobbe/Downloads";
  const files = [
    "P6 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
    "P7 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
    "P8 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
    "P9 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
    "P10 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
  ];

  let totalImported = 0;
  const year = 2026;

  for (const filename of files) {
    const filepath = path.join(downloadPath, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  File not found: ${filename}`);
      continue;
    }

    const workbook = XLSX.readFile(filepath);
    const periodMatch = filename.match(/P(\d+)/);
    const period = parseInt(periodMatch[1]);
    const weeks = periodWeeks[period];

    console.log(`📖 Processing ${filename} (Weeks ${weeks.join(", ")})`);

    // Process each sheet (each AM)
    for (const sheetName of workbook.SheetNames) {
      if (sheetName === "Blanco") continue;

      // Find AM by sheet name
      const am = await db.user.findFirst({
        where: {
          role: "AM",
          name: { contains: sheetName, mode: "insensitive" },
        },
      });

      if (!am) {
        console.log(`  ⚠️  ${sheetName} - no AM found`);
        continue;
      }

      const sheet = workbook.Sheets[sheetName];
      let periodo = null;
      let weeks_text = null;

      // Find period and weeks info
      for (let row = 0; row < 10; row++) {
        const periodoCell = XLSX.utils.encode_cell({ r: row, c: 1 });
        const weeksCell = XLSX.utils.encode_cell({ r: row, c: 1 });
        if (sheet[periodoCell]?.v === period) {
          periodo = period;
        }
      }

      // Extract factureerbare dagen data
      // Looking for "AFGESPROKEN DAGEN PER WEEK" section
      let weekRowStart = null;
      for (let row = 0; row < 30; row++) {
        const cellA = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (sheet[cellA]?.v?.includes("AFGESPROKEN")) {
          weekRowStart = row + 2; // Skip headers
          break;
        }
      }

      if (!weekRowStart) {
        console.log(`  ⚠️  ${am.name} - structure not found`);
        continue;
      }

      // Extract week data
      for (let i = 0; i < weeks.length; i++) {
        const weekRow = weekRowStart + i;
        const cellA = XLSX.utils.encode_cell({ r: weekRow, c: 0 });
        const weekNum = sheet[cellA]?.v;

        if (!weekNum || !weeks.includes(weekNum)) continue;

        // Sum all factureerbare dagen columns (starting from column B)
        let totalFactureerbaar = 0;
        for (let col = 1; col < 6; col++) {
          const cell = XLSX.utils.encode_cell({ r: weekRow, c: col });
          const value = sheet[cell]?.v;
          if (typeof value === "number") {
            totalFactureerbaar += value;
          }
        }

        // Create/update WeeklyReport
        const report = await db.weeklyReport.upsert({
          where: {
            amId_isoYear_isoWeek: {
              amId: am.id,
              isoYear: year,
              isoWeek: weekNum,
            },
          },
          update: { status: "SUBMITTED" },
          create: {
            amId: am.id,
            isoYear: year,
            isoWeek: weekNum,
            status: "SUBMITTED",
          },
        });

        // Find or create seed opdracht
        let opdracht = await db.opdracht.findFirst({
          where: { amId: am.id, naam: "Seed Data" },
        });

        if (!opdracht) {
          const klant = await db.klant.findFirst({
            where: { naam: "De Vlasschuur" },
          });

          opdracht = await db.opdracht.create({
            data: {
              naam: "Seed Data",
              rol: "WAM",
              amId: am.id,
              klantId: klant?.id || "",
            },
          });
        }

        // Delete and recreate entry
        await db.opdrachtEntry.deleteMany({
          where: {
            weeklyReportId: report.id,
            opdrachtId: opdracht.id,
          },
        });

        await db.opdrachtEntry.create({
          data: {
            weeklyReportId: report.id,
            opdrachtId: opdracht.id,
            factureerbareDagen: totalFactureerbaar,
            werkdagen: 0,
            bezoeken: 0,
            klanten: 0,
            afspraken: 0,
            deals: 0,
          },
        });

        totalImported++;
      }

      console.log(`  ✓ ${am.name}`);
    }
  }

  console.log(`\n✅ Klaar! ${totalImported} records ingeladen.`);
}

importPeriods()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
