const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.site.updateMany({
    data: {
      latitude: 14.7904576,
      longitude: -16.933619,
      radius: 100,
    }
  });
  console.log('✅ Site mis à jour, lignes affectées:', updated.count);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Erreur:', e);
  process.exit(1);
});
