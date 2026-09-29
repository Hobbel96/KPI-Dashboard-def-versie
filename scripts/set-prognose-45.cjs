const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function setPrognose45() {
  console.log("📝 Setting prognose to 45 dagen for all weeks 15-52...\n");

  const year = 2026;
  const ams = await db.user.findMany({
    where: { role: "AM" },
  });

  let created = 0;

  for (let week = 15; week <= 52; week++) {
    for (const am of ams) {
      // Skip weeks 22, 39-40 and 43+
      if (week === 22 || week === 39 || week === 40 || week >= 43) continue;

      await db.prognose.upsert({
        where: {
          amId_isoYear_isoWeek: {
            amId: am.id,
            isoYear: year,
            isoWeek: week,
          },
        },
        update: {
          factureerbareDagen: 45,
        },
        create: {
          amId: am.id,
          isoYear: year,
          isoWeek: week,
          factureerbareDagen: 45,
          enteredById: am.id,
        },
      });
      created++;
    }
  }

  console.log(`✅ Klaar! ${created} prognose records ingesteld op 45 dagen.`);
}

setPrognose45()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
