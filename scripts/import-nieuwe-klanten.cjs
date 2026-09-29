const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const nieuweKlantenData = {
  16: 20, 17: 19, 18: 21, 19: 32, 20: 24, 21: 10, 22: 25, 23: 24,
  24: 20, 25: 15, 26: 24, 27: 21, 28: 21, 29: 14, 30: 21, 31: 19,
  32: 22, 33: 19, 34: 7, 35: 22, 36: 25, 37: 37, 38: 28,
};

async function importNieuweKlanten() {
  try {
    const ams = await prisma.user.findMany({
      where: { role: 'AM' },
    });

    let upsertedCount = 0;

    for (const [weekStr, klanten] of Object.entries(nieuweKlantenData)) {
      const week = parseInt(weekStr);

      for (const am of ams) {
        await prisma.prognose.upsert({
          where: {
            amId_isoYear_isoWeek: {
              amId: am.id,
              isoYear: 2026,
              isoWeek: week,
            },
          },
          update: {
            klanten: Math.round(klanten / ams.length), // Distribute evenly
          },
          create: {
            amId: am.id,
            isoYear: 2026,
            isoWeek: week,
            klanten: Math.round(klanten / ams.length),
          },
        });
        upsertedCount++;
      }
    }

    console.log(`✅ Upserted ${upsertedCount} prognose records with nieuwe klanten data`);
  } catch (error) {
    console.error('Error importing nieuwe klanten:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importNieuweKlanten();
