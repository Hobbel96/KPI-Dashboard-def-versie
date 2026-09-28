const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

const newAMs = [
  {
    email: "jonathan.verhellen@devlasschuur.nl",
    name: "Jonathan Verhellen",
    password: "demo123",
  },
  {
    email: "ivan.vangompel@devlasschuur.nl",
    name: "Ivan van Gompel",
    password: "demo123",
  },
  {
    email: "sharon.cornelissen@devlasschuur.nl",
    name: "Sharon Cornelissen",
    password: "demo123",
  },
];

async function addAMs() {
  console.log("➕ Adding new accountmanagers...\n");

  for (const am of newAMs) {
    const passwordHash = await bcrypt.hash(am.password, 10);

    try {
      await db.user.create({
        data: {
          email: am.email,
          name: am.name,
          passwordHash,
          role: "AM",
          availableDaysPerWeek: 40,
        },
      });
      console.log(`✓ ${am.name}`);
      console.log(`  Email: ${am.email}`);
      console.log(`  Wachtwoord: ${am.password}\n`);
    } catch (error) {
      if (error.code === "P2002") {
        console.log(`⚠️  ${am.name} bestaat al\n`);
      } else {
        throw error;
      }
    }
  }

  // Show all AMs
  console.log("📋 All Accountmanagers:");
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

addAMs()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
