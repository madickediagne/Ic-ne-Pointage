const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      matricule: true,
      prenom: true,
      nom: true,
      role: true,
      status: true,
    },
  });
  console.log("Utilisateurs enregistrés dans Neon :", users);
  await prisma.$disconnect();
}

main().catch(console.error);
