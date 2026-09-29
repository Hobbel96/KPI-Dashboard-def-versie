const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearWeek39RAM() {
  try {
    // Clear nieuweAfspraken and deals for week 39
    const result = await prisma.prognose.updateMany({
      where: {
        isoWeek: 39,
        isoYear: 2026,
      },
      data: {
        nieuweAfspraken: null,
        deals: null,
      },
    });

    console.log(`✅ Cleared ${result.count} records for week 39 (nieuweAfspraken and deals)`);
  } catch (error) {
    console.error('Error clearing week 39:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearWeek39RAM();
