const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

const mtAccounts = [
  {
    email: "tim.schepmans@devlasschuur.nl",
    name: "Tim Schepmans",
    password: "tim123",
  },
  {
    email: "dave.niestadt@devlasschuur.nl",
    name: "Dave Niestadt",
    password: "dave123",
  },
  {
    email: "naftali.vlaanderen@devlasschuur.nl",
    name: "Naftali Vlaanderen",
    password: "naftali123",
  },
  {
    email: "jan.hobbel@devlasschuur.nl",
    name: "Jan Hobbel",
    password: "jan123",
  },
];

async function updateAccounts() {
  console.log("🔐 Updating MT test accounts...\n");

  for (const account of mtAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    const user = await db.user.update({
      where: { email: account.email },
      data: { passwordHash },
    });
    console.log(`✓ ${account.name}`);
    console.log(`  Email: ${account.email}`);
    console.log(`  Wachtwoord: ${account.password}\n`);
  }

  console.log("✅ MT test accounts updated!");
}

updateAccounts()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
