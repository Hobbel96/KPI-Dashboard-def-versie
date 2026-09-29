const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function addRonald() {
  console.log("➕ Adding Ronald van der Velde...\n");

  const passwordHash = await bcrypt.hash("demo123", 10);

  const ronald = await db.user.create({
    data: {
      email: "ronald.vandervelde@devlasschuur.nl",
      name: "Ronald van der Velde",
      passwordHash,
      role: "AM",
      availableDaysPerWeek: 20,
    },
  });

  console.log(`✓ ${ronald.name} (${ronald.email})`);
  console.log(`\n✅ Klaar!`);
}

addRonald()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
