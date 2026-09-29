const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function clearWeeks() {
  console.log("🗑️  Clearing data from weeks 41-42...\n");

  const year = 2026;

  // Delete Prognose records for weeks 41-42
  const deletedPrognose = await db.prognose.deleteMany({
    where: {
      isoYear: year,
      isoWeek: { in: [41, 42] },
    },
  });

  // Delete WeeklyReport records for weeks 41-42
  const deletedReports = await db.weeklyReport.deleteMany({
    where: {
      isoYear: year,
      isoWeek: { in: [41, 42] },
    },
  });

  console.log(`✓ Prognose: ${deletedPrognose.count} records verwijderd`);
  console.log(`✓ WeeklyReport: ${deletedReports.count} records verwijderd`);
  console.log(
    `\n✅ Klaar! ${deletedPrognose.count + deletedReports.count} records verwijderd.`
  );
}

clearWeeks()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
