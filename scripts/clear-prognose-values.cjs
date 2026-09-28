const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function clearValues() {
  console.log("🧹 Clearing prognose values...\n");

  // Clear all prognose factureerbare dagen
  const result = await db.prognose.updateMany({
    data: {
      factureerbareDagen: null,
    },
  });

  console.log(`✓ ${result.count} prognose records geleegd`);
  console.log("\n✅ Factureerbare dagen kunnen nu door leidinggevenden worden ingevuld!");
}

clearValues()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
