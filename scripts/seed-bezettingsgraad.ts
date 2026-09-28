import { db } from "@/lib/db";

const bezettingsgradData = [
  { week: 38, percentage: 93.8 },
  { week: 39, percentage: 87.5 },
  { week: 40, percentage: 91.2 },
  { week: 41, percentage: 95.1 },
  { week: 42, percentage: 89.3 },
  { week: 43, percentage: 92.7 },
  { week: 44, percentage: 88.5 },
  { week: 45, percentage: 94.2 },
  { week: 46, percentage: 90.8 },
  { week: 47, percentage: 96.3 },
  { week: 48, percentage: 85.6 },
  { week: 49, percentage: 93.4 },
];

async function seedBezettingsgraad() {
  console.log("📊 Starting Bezettingsgraad seed...");

  // Get all AMs
  const allAMs = await db.user.findMany({
    where: { role: "AM" },
  });

  if (allAMs.length === 0) {
    console.log("❌ Geen AMs gevonden");
    return;
  }

  console.log(`✓ Found ${allAMs.length} AMs`);

  // Get system user (MT) for enteredById
  const mtUser = await db.user.findFirst({
    where: { role: "MT" },
  });

  if (!mtUser) {
    console.log("❌ Geen MT user gevonden");
    return;
  }

  const year = new Date().getFullYear();
  let created = 0;

  // Import for each week
  for (const item of bezettingsgradData) {
    // Apply percentage to ALL AMs
    for (const am of allAMs) {
      const factureerbareDagen = (item.percentage / 100) * (am.availableDaysPerWeek || 40);

      const prognose = await db.prognose.upsert({
        where: {
          amId_isoYear_isoWeek: {
            amId: am.id,
            isoYear: year,
            isoWeek: item.week,
          },
        },
        update: { factureerbareDagen },
        create: {
          amId: am.id,
          isoYear: year,
          isoWeek: item.week,
          factureerbareDagen,
          enteredById: mtUser.id,
        },
      });

      created++;
    }

    console.log(`✓ Week ${item.week}: ${item.percentage}% → ${allAMs.length} AMs`);
  }

  console.log(`\n✅ Klaar! ${created} Prognose records aangemaakt`);
}

seedBezettingsgraad()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .then(() => process.exit(0));
