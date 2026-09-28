const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function cleanup() {
  console.log("🗑️  Removing dummy accountmanager accounts...\n");

  const dummyEmails = [
    "accountmanager1@devlasschuur.nl",
    "accountmanager2@devlasschuur.nl",
    "accountmanager3@devlasschuur.nl",
  ];

  for (const email of dummyEmails) {
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      // Delete all Prognose records by this user first
      await db.prognose.deleteMany({
        where: { amId: user.id },
      });

      // Delete all WeeklyReport records by this user
      await db.weeklyReport.deleteMany({
        where: { amId: user.id },
      });

      // Now delete the user
      await db.user.delete({
        where: { id: user.id },
      });

      console.log(`✓ Verwijderd: ${email}`);
    }
  }

  // Show remaining AMs
  console.log("\n📋 Remaining Accountmanagers:");
  const ams = await db.user.findMany({
    where: { role: "AM" },
    orderBy: { name: "asc" },
    select: { name: true, email: true },
  });

  ams.forEach((am) => {
    console.log(`  • ${am.name} (${am.email})`);
  });

  console.log(`\n✅ Klaar! ${ams.length} accountmanagers beschikbaar.`);
}

cleanup()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
