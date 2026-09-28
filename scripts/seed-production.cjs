const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// Use production DATABASE_URL from environment
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

// Seed users first
const seedUsers = [
  {
    email: "ronald.vandervelde@devlasschuur.nl",
    name: "Ronald van der Velde",
    password: "demo123",
    role: "MT",
    availableDaysPerWeek: null,
  },
  {
    email: "dave.niestadt@devlasschuur.nl",
    name: "Dave Niestadt",
    password: "demo123",
    role: "MT",
    availableDaysPerWeek: null,
  },
  {
    email: "naftali.vlaanderen@devlasschuur.nl",
    name: "Naftali Vlaanderen",
    password: "demo123",
    role: "MT",
    availableDaysPerWeek: null,
  },
  {
    email: "tim.schepmans@devlasschuur.nl",
    name: "Tim Schepmans",
    password: "demo123",
    role: "MT",
    availableDaysPerWeek: null,
  },
  {
    email: "jan.hobbel@devlasschuur.nl",
    name: "Jan Hobbel",
    password: "demo123",
    role: "MT",
    availableDaysPerWeek: null,
  },
  {
    email: "sjoerd.vanmook@devlasschuur.nl",
    name: "Sjoerd van Mook",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
  {
    email: "herman.jonker@devlasschuur.nl",
    name: "Herman Jonker",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
  {
    email: "david.vos@devlasschuur.nl",
    name: "David Vos",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
  {
    email: "fons.blomhert@devlasschuur.nl",
    name: "Fons Blomhert",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
  {
    email: "erik.stegeman@devlasschuur.nl",
    name: "Erik Stegeman",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
  {
    email: "mascha.rietjens@devlasschuur.nl",
    name: "Mascha Rietjens",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
  {
    email: "accountmanager1@devlasschuur.nl",
    name: "Account Manager 1",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
  {
    email: "accountmanager2@devlasschuur.nl",
    name: "Account Manager 2",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
  {
    email: "accountmanager3@devlasschuur.nl",
    name: "Account Manager 3",
    password: "demo123",
    role: "AM",
    availableDaysPerWeek: 40,
  },
];

const seedKlanten = [
  { naam: "AW Groep (0,5)" },
  { naam: "Copijn (0,5)" },
  { naam: "Redelijkheid" },
  { naam: "De Vlasschuur" },
  { naam: "Veel Liefs" },
  { naam: "Renett" },
  { naam: "Balls & Glory" },
  { naam: "Renett Frankrijk" },
  { naam: "Fando" },
  { naam: "Sore" },
  { naam: "Windmolenkaas" },
  { naam: "Agropasta" },
  { naam: "Delizioso" },
  { naam: "Roka" },
  { naam: "Academy" },
  { naam: "Spreadmaker" },
  { naam: "Grate Goods" },
  { naam: "Fish Tales" },
  { naam: "Ginger Club" },
  { naam: "Guy De Winne" },
  { naam: "Braai BBQ" },
  { naam: "Inwerkschema" },
  { naam: "Benbits" },
];

async function seed() {
  console.log("🌱 Starting production seed...");

  // Seed users
  console.log("👤 Seeding users...");
  for (const user of seedUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await db.user.upsert({
      where: { email: user.email },
      update: { passwordHash },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
        availableDaysPerWeek: user.availableDaysPerWeek,
      },
    });
  }
  console.log(`✓ ${seedUsers.length} users seeded`);

  // Seed klanten
  console.log("🏢 Seeding klanten...");
  for (const klant of seedKlanten) {
    await db.klant.upsert({
      where: { naam: klant.naam },
      update: {},
      create: klant,
    });
  }
  console.log(`✓ ${seedKlanten.length} klanten seeded`);

  // Get all users and seed opdrachten data
  const allAMs = await db.user.findMany({
    where: { role: "AM" },
  });
  const mtUser = await db.user.findFirst({
    where: { role: "MT" },
  });

  if (allAMs.length === 0 || !mtUser) {
    console.log("❌ Missing users for data seeding");
    return;
  }

  // Create seed Klant
  const seedKlant = await db.klant.upsert({
    where: { naam: "De Vlasschuur" },
    update: {},
    create: { naam: "De Vlasschuur" },
  });

  // Create seed Opdracht
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

  // Seed bezettingsgraad data
  console.log("📊 Seeding bezettingsgraad data...");
  for (const item of bezettingsgradData) {
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

      // REALISATIE
      const realisatieFactureerbareDagen = (item.percentage / 100) * (am.availableDaysPerWeek || 40);

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

  console.log(`\n✅ Production seed complete!`);
  console.log(`  - ${seedUsers.length} users`);
  console.log(`  - ${seedKlanten.length} klanten`);
  console.log(`  - ${pronosesCreated} Prognose records`);
  console.log(`  - ${realisatieCreated} WeeklyReport entries`);
}

seed()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
