const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function cleanup() {
  console.log("🗑️  Removing week 39-40 data...\n");

  const result = await db.prognose.deleteMany({
    where: {
      isoWeek: { in: [39, 40] },
      isoYear: 2026,
    },
  });

  console.log(`✓ Verwijderd: ${result.count} records`);
}

cleanup()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
