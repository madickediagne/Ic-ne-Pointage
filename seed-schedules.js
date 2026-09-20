const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Initialisation des horaires par défaut (08:00 - 17:00, tolérance 15 min)...");

  const departements = await prisma.department.findMany({
    where: { status: "ACTIF" },
    include: { schedules: true },
  });

  for (const dept of departements) {
    if (dept.schedules.length === 0) {
      await prisma.schedule.create({
        data: {
          departmentId: dept.id,
          startTime: "08:00",
          endTime: "17:00",
          tolerance: 15,
          workingDays: [1, 2, 3, 4, 5], // Lundi → Vendredi
        },
      });
      console.log(`✅ Horaire créé pour : ${dept.name}`);
    } else {
      // Mettre à jour si déjà existant
      await prisma.schedule.updateMany({
        where: { departmentId: dept.id },
        data: {
          startTime: "08:00",
          endTime: "17:00",
          tolerance: 15,
          workingDays: [1, 2, 3, 4, 5],
        },
      });
      console.log(`🔄 Horaire synchronisé pour : ${dept.name}`);
    }
  }

  const all = await prisma.schedule.findMany({ include: { department: { select: { name: true } } } });
  console.log("\n📅 Horaires actuels :", all.map(s => `${s.department.name}: ${s.startTime}-${s.endTime} (tol: ${s.tolerance}min)`));

  await prisma.$disconnect();
}

main().catch(console.error);
