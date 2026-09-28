import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Delete existing data
  await db.user.deleteMany();
  await db.team.deleteMany();
  await db.kpi.deleteMany();
  await db.mtOnlyKpi.deleteMany();

  // Hash demo password
  const hashedPassword = await bcrypt.hash("demo123", 10);

  // Create Teams
  const teamNaftali = await db.team.create({
    data: { name: "Team Naftali" },
  });

  const teamDave = await db.team.create({
    data: { name: "Team Dave" },
  });

  const teamJan = await db.team.create({
    data: { name: "Team Jan" },
  });

  // Create Leadership + MT
  const mtAdmin = await db.user.create({
    data: {
      email: "mt@devlasschuur.nl",
      name: "MT Admin",
      passwordHash: hashedPassword,
      role: "MT",
    },
  });

  const naftali = await db.user.create({
    data: {
      email: "naftali@devlasschuur.nl",
      name: "Naftali",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamNaftali.id,
    },
  });

  const dave = await db.user.create({
    data: {
      email: "dave@devlasschuur.nl",
      name: "Dave",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamDave.id,
    },
  });

  const jan = await db.user.create({
    data: {
      email: "jan@devlasschuur.nl",
      name: "Jan",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamJan.id,
    },
  });

  const tim = await db.user.create({
    data: {
      email: "tim@devlasschuur.nl",
      name: "Tim",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamJan.id, // Tim is in Jan's team but also leads
    },
  });

  // Create Accountmanagers for Team Naftali
  await db.user.create({
    data: {
      email: "ronald@devlasschuur.nl",
      name: "Ronald",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamNaftali.id,
    },
  });

  await db.user.create({
    data: {
      email: "sjoerd@devlasschuur.nl",
      name: "Sjoerd",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamNaftali.id,
    },
  });

  // Create Accountmanagers for Team Dave
  await db.user.create({
    data: {
      email: "herman@devlasschuur.nl",
      name: "Herman",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamDave.id,
    },
  });

  await db.user.create({
    data: {
      email: "david@devlasschuur.nl",
      name: "David",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamDave.id,
    },
  });

  // Create Accountmanagers for Team Jan
  await db.user.create({
    data: {
      email: "fons@devlasschuur.nl",
      name: "Fons",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamJan.id,
    },
  });

  await db.user.create({
    data: {
      email: "erik@devlasschuur.nl",
      name: "Erik",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
      teamId: teamJan.id,
    },
  });

  // Create Accountmanagers without team assignment yet
  await db.user.create({
    data: {
      email: "mascha@devlasschuur.nl",
      name: "Mascha",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
    },
  });

  await db.user.create({
    data: {
      email: "ivan@devlasschuur.nl",
      name: "Ivan",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
    },
  });

  await db.user.create({
    data: {
      email: "jonathan@devlasschuur.nl",
      name: "Jonathan",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
    },
  });

  await db.user.create({
    data: {
      email: "sharon@devlasschuur.nl",
      name: "Sharon",
      passwordHash: hashedPassword,
      role: "AM",
      availableDaysPerWeek: 40,
    },
  });

  // Create Standard KPI's
  await db.kpi.createMany({
    data: [
      {
        naam: "Bezettingsgraad",
        eenheid: "%",
        prognose: 85,
        volgorde: 1,
      },
      {
        naam: "Factureerbare Dagen per Week",
        eenheid: "dagen",
        prognose: 32,
        volgorde: 2,
      },
      {
        naam: "Gemiddeld Weekcijfer",
        eenheid: "score",
        prognose: 7.5,
        volgorde: 3,
      },
      {
        naam: "Team Totalen",
        eenheid: "-",
        volgorde: 4,
      },
      {
        naam: "Prognose vs Realisatie",
        eenheid: "-",
        volgorde: 5,
      },
    ],
  });

  // Create MT-Only KPI's
  await db.mtOnlyKpi.createMany({
    data: [
      {
        naam: "Kwartaaldoel",
        eenheid: "€",
        volgorde: 1,
      },
      {
        naam: "Contactmomenten Opdrachtgevers",
        eenheid: "stuks",
        volgorde: 2,
      },
      {
        naam: "Nieuwe C.V.'s",
        eenheid: "stuks",
        volgorde: 3,
      },
      {
        naam: "Openstaand Bedrag Facturen",
        eenheid: "€",
        volgorde: 4,
      },
    ],
  });

  console.log("✓ Database seeded with all employees");
  console.log("\nTeams:");
  console.log(`  Team Naftali: Naftali (lead), Ronald, Sjoerd`);
  console.log(`  Team Dave: Dave (lead), Herman, David`);
  console.log(`  Team Jan: Jan (lead), Tim, Fons, Erik`);
  console.log(`\nUnassigned: Mascha, Ivan, Jonathan, Sharon`);
  console.log("\nDemo credentials:");
  console.log("  MT Login: mt@devlasschuur.nl / demo123");
  console.log("  AM Login: any AM email (ronald@, sjoerd@, etc.) / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
