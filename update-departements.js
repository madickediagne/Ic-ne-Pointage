const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const departements = [
  "Tabataba Incubateur",
  "Tabataba Préscolaire",
  "Bureau Étude et Opportunités",
  "Bana Bana Startup",
  "Agence de Marketing Digital Tellmi",
  "Institut des Métiers du Numérique",
];

async function main() {
  console.log("Mise à jour des départements Icône Groupe...");

  for (const name of departements) {
    await prisma.department.upsert({
      where: { name },
      update: { status: "ACTIF" },
      create: { name, status: "ACTIF" },
    });
    console.log(`✅ Département enregistré : ${name}`);
  }

  const all = await prisma.department.findMany({ select: { id: true, name: true } });
  console.log("\nListe complète dans Neon :", all);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Erreur :", e);
  process.exit(1);
});
