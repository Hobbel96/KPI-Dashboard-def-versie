const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) {
    process.env[key] = value.replace(/^"|"$/g, "");
  }
});

const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

const bezettingsgradData = [
  { week: 15, percentage: 93.80 },
  { week: 16, percentage: 100.00 },
  { week: 17, percentage: 100.00 },
  { week: 18, percentage: 97.00 },
  { week: 19, percentage: 100.00 },
  { week: 20, percentage: 100.00 },
  { week: 21, percentage: 100.00 },
  { week: 22, percentage: 100.00 },
  { week: 23, percentage: 100.00 },
  { week: 24, percentage: 100.00 },
  { week: 25, percentage: 100.00 },
  { week: 26, percentage: 92.30 },
  { week: 27, percentage: 98.78 },
  { week: 28, percentage: 96.88 },
  { week: 29, percentage: 96.77 },
  { week: 30, percentage: 96.43 },
  { week: 31, percentage: 100.00 },
  { week: 32, percentage: 100.00 },
  { week: 33, percentage: 90.60 },
  { week: 34, percentage: 95.00 },
  { week: 35, percentage: 86.00 },
  { week: 36, percentage: 93.18 },
  { week: 37, percentage: 95.35 },
  { week: 38, percentage: 93.80 },
  { week: 39, percentage: 87.50 },
  { week: 40, percentage: 91.20 },
  { week: 41, percentage: 95.10 },
  { week: 42, percentage: 89.30 },
  { week: 43, percentage: 92.70 },
  { week: 44, percentage: 88.50 },
  { week: 45, percentage: 94.20 },
  { week: 46, percentage: 90.80 },
  { week: 47, percentage: 96.30 },
  { week: 48, percentage: 85.60 },
  { week: 49, percentage: 93.40 },
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

  // Get or create seed Klant
  const seedKlant = await db.klant.upsert({
    where: { naam: "Seed Klant" },
    update: {},
    create: { naam: "Seed Klant" },
  });

  // Create or get seed Opdracht (linked to first AM and seed klant)
  const seedOpdracht = await db.opdracht.upsert({
    where: { id: "seed-opdracht" },
    update: {},
    create: {
      id: "seed-opdracht",
      naam: "Seed Data",
      rol: "WAM",
      amId: allAMs[0].id,
      klantId: seedKlant.id,
    },
  });

  const year = new Date().getFullYear();
  let pronosesCreated = 0;
  let realisatieCreated = 0;

  // Import for each week
  for (const item of bezettingsgradData) {
    // Apply percentage to ALL AMs
    for (const am of allAMs) {
      // PROGNOSE: Always 95%
      const prognoseFactureerbareDagen = (95 / 100) * (am.availableDaysPerWeek || 40);

      await db.prognose.upsert({
        where: {
          amId_isoYear_isoWeek: {
            amId: am.id,
            isoYear: year,
            isoWeek: item.week,
          },
        },
        update: { factureerbareDagen: prognoseFactureerbareDagen },
        create: {
          amId: am.id,
          isoYear: year,
          isoWeek: item.week,
          factureerbareDagen: prognoseFactureerbareDagen,
          enteredById: mtUser.id,
        },
      });

      pronosesCreated++;

      // REALISATIE: Create WeeklyReport with actual data
      const realisatieFactureerbareDagen = (item.percentage / 100) * (am.availableDaysPerWeek || 40);

      // Create or update WeeklyReport
      const report = await db.weeklyReport.upsert({
        where: {
          amId_isoYear_isoWeek: {
            amId: am.id,
            isoYear: year,
            isoWeek: item.week,
          },
        },
        update: { status: "SUBMITTED" },
        create: {
          amId: am.id,
          isoYear: year,
          isoWeek: item.week,
          status: "SUBMITTED",
          weekcijfer: null,
        },
      });

      // Create or update OpdrachtEntry with realisatie data
      await db.opdrachtEntry.upsert({
        where: {
          weeklyReportId_opdrachtId: {
            weeklyReportId: report.id,
            opdrachtId: "seed-opdracht",
          },
        },
        update: { factureerbareDagen: realisatieFactureerbareDagen },
        create: {
          weeklyReportId: report.id,
          opdrachtId: "seed-opdracht",
          factureerbareDagen: realisatieFactureerbareDagen,
          werkdagen: 0,
          bezoeken: 0,
          klanten: 0,
          afspraken: 0,
          deals: 0,
        },
      });

      realisatieCreated++;
    }

    console.log(`✓ Week ${item.week}: Prognose 95% | Realisatie ${item.percentage}%`);
  }

  console.log(`\n✅ Klaar!`);
  console.log(`  - ${pronosesCreated} Prognose records (95%)`);
  console.log(`  - ${realisatieCreated} WeeklyReport entries (realisatie)`);
}

seedBezettingsgraad()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
