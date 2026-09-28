const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const path = require("path");

const db = new PrismaClient();

async function importKPIDashboard() {
  console.log("📥 Importing KPI Dashboard Bezettingsgraad Realisatie...\n");

  const filepath = path.join(__dirname, "..", "KPI-Dashboard.xlsx");
  const workbook = XLSX.readFile(filepath);
  const sheet = workbook.Sheets["Weekly Dashboard"];

  const year = 2026;
  let totalImported = 0;

  // Row 3 = weeknummers (0-indexed = row 2)
  // Row 6 = bezettingsgraad realisatie (0-indexed = row 5)

  const weekRow = 2; // Row 3 in Excel
  const bezettingsgradRow = 5; // Row 6 in Excel

  // Get first AM to store the global bezettingsgraad data
  const firstAM = await db.user.findFirst({
    where: { role: "AM" },
  });

  if (!firstAM) {
    console.log("❌ Geen accountmanagers gevonden!");
    process.exit(1);
  }

  console.log(`Storing in: ${firstAM.name}\n`);

  // Parse all columns starting from column B (col 1)
  for (let col = 1; col <= 50; col++) {
    const weekCell = XLSX.utils.encode_cell({ r: weekRow, c: col });
    const bezettingsgradCell = XLSX.utils.encode_cell({ r: bezettingsgradRow, c: col });

    const weekValue = sheet[weekCell]?.v;
    const bezettingsgradValue = sheet[bezettingsgradCell]?.v;

    if (!weekValue) continue;

    // Extract week number from "Week 21" format
    const weekMatch = String(weekValue).match(/(\d+)/);
    if (!weekMatch) continue;

    const weekNum = parseInt(weekMatch[1]);
    if (isNaN(weekNum) || weekNum < 15 || weekNum > 49) continue;

    const bezettingsgradPercentage = parseFloat(bezettingsgradValue);
    if (isNaN(bezettingsgradPercentage)) continue;

    // Convert decimal to percentage (0.9535 -> 95.35)
    const percentage = Math.round(bezettingsgradPercentage * 10000) / 100;

    // Upsert Prognose with bezettingsgradRealisatiePercentage
    await db.prognose.upsert({
      where: {
        amId_isoYear_isoWeek: {
          amId: firstAM.id,
          isoYear: year,
          isoWeek: weekNum,
        },
      },
      update: {
        bezettingsgradRealisatiePercentage: percentage,
      },
      create: {
        amId: firstAM.id,
        isoYear: year,
        isoWeek: weekNum,
        bezettingsgradRealisatiePercentage: percentage,
        enteredById: firstAM.id,
      },
    });

    console.log(`  ✓ Week ${weekNum}: ${percentage}%`);
    totalImported++;
  }

  console.log(`\n✅ Klaar! ${totalImported} weken ingeladen.`);
}

importKPIDashboard()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
