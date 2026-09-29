const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function fillMissingWeeks() {
  console.log("📝 Filling missing weeks with 0...\n");

  const year = 2026;
  const firstAM = await db.user.findFirst({
    where: { role: "AM" },
  });

  if (!firstAM) {
    console.log("❌ Geen accountmanagers gevonden!");
    process.exit(1);
  }

  let created = 0;

  // Fill weeks 15-52 (hele jaar)
  for (let week = 15; week <= 52; week++) {
    const existing = await db.prognose.findUnique({
      where: {
        amId_isoYear_isoWeek: {
          amId: firstAM.id,
          isoYear: year,
          isoWeek: week,
        },
      },
    });

    if (!existing) {
      await db.prognose.create({
        data: {
          amId: firstAM.id,
          isoYear: year,
          isoWeek: week,
          factureerbareDagenRealisatie: 0,
          enteredById: firstAM.id,
        },
      });
      created++;
      console.log(`  ✓ Week ${week}: 0 dagen`);
    }
  }

  console.log(`\n✅ Klaar! ${created} weken aangemaakt met 0.`);
}

fillMissingWeeks()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
