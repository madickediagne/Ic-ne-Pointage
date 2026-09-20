const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const vraisDepartements = [
  "Tabataba Incubateur",
  "Tabataba Préscolaire",
  "Bureau Étude et Opportunités",
  "Bana Bana Startup",
  "Agence de Marketing Digital Tellmi",
  "Institut des Métiers du Numérique",
];

async function main() {
  // Mettre en INACTIF tout département qui n'est pas dans la liste officielle
  await prisma.department.updateMany({
    where: {
      name: { notIn: vraisDepartements },
    },
    data: {
      status: "INACTIF",
    },
  });

  const actifs = await prisma.department.findMany({
    where: { status: "ACTIF" },
    select: { name: true },
  });

  console.log("✅ Départements officiels actifs :", actifs.map((d) => d.name));
  await prisma.$disconnect();
}

main().catch(console.error);
