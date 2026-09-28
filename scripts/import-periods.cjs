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
  console.log("📥 Importing P6-P10 weekcijfer data...\n");

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

      // Extract weekcijfer data from cells I10:I13 (0-indexed: row 9-12, col 8)
      for (let i = 0; i < weeks.length; i++) {
        const weekNum = weeks[i];
        const cellAddress = XLSX.utils.encode_cell({ r: 9 + i, c: 8 }); // I10:I13
        let cellValue = sheet[cellAddress]?.v;

        // Handle string values with dashes (e.g., "7-" becomes 7)
        let weekcijfer = null;
        if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
          if (typeof cellValue === "string") {
            weekcijfer = parseFloat(cellValue.replace(/[^0-9.]/g, ""));
            if (isNaN(weekcijfer)) weekcijfer = null;
          } else if (typeof cellValue === "number") {
            weekcijfer = cellValue;
          }
        }

        if (weekcijfer === null) continue;

        // Create or update WeeklyReport with weekcijfer
        const report = await db.weeklyReport.upsert({
          where: {
            amId_isoYear_isoWeek: {
              amId: am.id,
              isoYear: year,
              isoWeek: weekNum,
            },
          },
          update: {
            weekcijfer: weekcijfer,
            status: "SUBMITTED"
          },
          create: {
            amId: am.id,
            isoYear: year,
            isoWeek: weekNum,
            weekcijfer: weekcijfer,
            status: "SUBMITTED",
          },
        });

        totalImported++;
      }

      console.log(`  ✓ ${am.name}`);
    }
  }

  console.log(`\n✅ Klaar! ${totalImported} weekcijfers ingeladen.`);
}

importPeriods()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
