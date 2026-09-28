const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function cleanup() {
  console.log("🔧 Cleaning up accounts...\n");

  // Delete Ronald - first reassign his prognoses to Tim
  console.log("🗑️  Removing Ronald...");
  const ronald = await db.user.findUnique({
    where: { email: "ronald.vandervelde@devlasschuur.nl" },
  });

  const tim = await db.user.findUnique({
    where: { email: "tim.schepmans@devlasschuur.nl" },
  });

  if (ronald && tim) {
    // Reassign all Prognose records from Ronald to Tim
    await db.prognose.updateMany({
      where: { enteredById: ronald.id },
      data: { enteredById: tim.id },
    });

    // Now delete Ronald
    await db.user.delete({
      where: { id: ronald.id },
    });
    console.log("✓ Ronald verwijderd en zijn prognoses aan Tim toegewezen\n");
  }

  // Create Tim AM account
  console.log("➕ Creating Tim AM account...");
  const timAMPassword = "tim.am123";
  const timAMHash = await bcrypt.hash(timAMPassword, 10);

  await db.user.create({
    data: {
      email: "tim.am@devlasschuur.nl",
      name: "Tim Schepmans (AM)",
      passwordHash: timAMHash,
      role: "AM",
      availableDaysPerWeek: 40,
    },
  });

  console.log("✓ Tim AM account aangemaakt");
  console.log(`  Email: tim.am@devlasschuur.nl`);
  console.log(`  Wachtwoord: ${timAMPassword}\n`);

  console.log("✅ Klaar!");
}

cleanup()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
