const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

const periodWeeks = {
  6: [21, 22, 23, 24],
  7: [25, 26, 27, 28],
  8: [29, 30, 31, 32],
  9: [33, 34, 35, 36],
  10: [37, 38, 39, 40],
};

async function fixFactureerbareDagen() {
  console.log("🔧 Fixing factureerbare dagen from Excel row 17...\n");

  const downloadPath = "C:/Users/hobbe/Downloads";
  const files = [
    "P6 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
    "P7 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
    "P8 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
    "P9 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
    "P10 Urenverantwoording De Vlasschuur_2026 met doelstellingen.xlsx",
  ];

  let totalFixed = 0;
  const year = 2026;

  for (const filename of files) {
    const filepath = path.join(downloadPath, filename);
    if (!fs.existsSync(filepath)) continue;

    const workbook = XLSX.readFile(filepath);
    const periodMatch = filename.match(/P(\d+)/);
    const period = parseInt(periodMatch[1]);
    const weeks = periodWeeks[period];

    console.log(`📖 ${filename}`);

    for (const sheetName of workbook.SheetNames) {
      if (sheetName === "Blanco") continue;

      // Match by first name
      const ams = await db.user.findMany({
        where: { role: "AM" },
      });

      const am = ams.find(a => {
        const firstName = a.name.split(" ")[0].toLowerCase();
        return firstName === sheetName.toLowerCase();
      });

      if (!am) {
        console.log(`    ⚠️  "${sheetName}" - no match found`);
        continue;
      }

      const sheet = workbook.Sheets[sheetName];
      const factureerbareCellAddress = XLSX.utils.encode_cell({ r: 16, c: 8 }); // I17
      let totalFactureerbareCellValue = sheet[factureerbareCellAddress]?.v;
      let totalFactureerbaar = null;

      if (totalFactureerbareCellValue !== undefined && totalFactureerbareCellValue !== null && totalFactureerbareCellValue !== "") {
        if (typeof totalFactureerbareCellValue === "string") {
          totalFactureerbaar = parseFloat(totalFactureerbareCellValue.replace(/[^0-9.]/g, ""));
          if (isNaN(totalFactureerbaar)) totalFactureerbaar = null;
        } else if (typeof totalFactureerbareCellValue === "number") {
          totalFactureerbaar = totalFactureerbareCellValue;
        }
      }

      if (totalFactureerbaar === null) continue;

      // Update all entries for these weeks
      for (const weekNum of weeks) {
        const reports = await db.weeklyReport.findMany({
          where: {
            amId: am.id,
            isoYear: year,
            isoWeek: weekNum,
          },
          select: { id: true },
        });

        for (const report of reports) {
          // Update all opdrachtentries for this report
          await db.opdrachtEntry.updateMany({
            where: { weeklyReportId: report.id },
            data: { factureerbareDagen: totalFactureerbaar },
          });

          totalFixed++;
        }
      }

      console.log(`  ✓ ${am.name}: ${totalFactureerbaar} dagen`);
    }
  }

  console.log(`\n✅ Klaar! ${totalFixed} records bijgewerkt.`);
}

fixFactureerbareDagen()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
