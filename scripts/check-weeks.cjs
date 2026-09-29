const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

(async () => {
  const am = await db.user.findFirst({ where: { role: "AM" } });
  const week22 = await db.prognose.findFirst({ where: { amId: am.id, isoWeek: 22 } });
  const week43 = await db.prognose.findFirst({ where: { amId: am.id, isoWeek: 43 } });

  console.log("Week 22:", week22 ? "EXISTS - " + JSON.stringify(week22) : "NOT FOUND");
  console.log("Week 43:", week43 ? "EXISTS - " + JSON.stringify(week43) : "NOT FOUND");

  await db.$disconnect();
})();
