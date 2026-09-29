const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function clearWeeks() {
  console.log("🗑️  Clearing week 22 and weeks 43+...\n");

  const year = 2026;
  const firstAM = await db.user.findFirst({
    where: { role: "AM" },
  });

  if (!firstAM) {
    console.log("❌ Geen accountmanagers gevonden!");
    process.exit(1);
  }

  // Delete week 22
  const deleted22 = await db.prognose.deleteMany({
    where: {
      amId: firstAM.id,
      isoYear: year,
      isoWeek: 22,
    },
  });

  // Delete weeks 43+
  const deleted43Plus = await db.prognose.deleteMany({
    where: {
      amId: firstAM.id,
      isoYear: year,
      isoWeek: { gte: 43 },
    },
  });

  console.log(`✓ Week 22: ${deleted22.count} records verwijderd`);
  console.log(`✓ Weeks 43+: ${deleted43Plus.count} records verwijderd`);
  console.log(`\n✅ Klaar! ${deleted22.count + deleted43Plus.count} records verwijderd.`);
}

clearWeeks()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
