import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début de l'initialisation de la base de données...");

  // ─── 1. Départements ───────────────────────────────────────────────────────
  console.log("Création des départements...");
  const departments = [
    { name: "Direction", description: "Direction générale" },
    { name: "Administration", description: "Administration et RH" },
    { name: "Finance", description: "Comptabilité et Finance" },
    { name: "Technique", description: "Développement et Maintenance" },
    { name: "Numérique", description: "Marketing Digital et IA" },
    { name: "Communication", description: "Communication et Relations Publiques" },
    { name: "Pédagogique", description: "Formations et Suivi" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }
  
  const adminDept = await prisma.department.findUnique({
    where: { name: "Direction" }
  });

  // ─── 2. Utilisateur Super Admin ────────────────────────────────────────────
  console.log("Création de l'utilisateur Super Admin...");
  const adminPassword = await bcrypt.hash("Admin@2026", 10);
  
  await prisma.user.upsert({
    where: { matricule: "ICN001" },
    update: {},
    create: {
      matricule: "ICN001",
      nom: "Admin",
      prenom: "Super",
      email: "admin@icone-groupe.sn",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      departmentId: adminDept?.id,
    },
  });

  // ─── 3. Site Principal (Thiès) ─────────────────────────────────────────────
  console.log("Création du site Icône Groupe Thiès...");
  
  // Générer un secret unique pour le QR Code
  const qrSecret = crypto.randomBytes(32).toString("hex");
  // ID unique statique pour le QR Code de test
  const initialQrCode = `QR-THIES-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  // Coordonnées approximatives d'Icône Groupe à Thiès (à mettre à jour en prod)
  // 14.8038° N, 16.9248° W (Exemple central de Thiès)
  const thiesSite = await prisma.site.upsert({
    where: { qrCode: initialQrCode }, // Le champ unique est qrCode
    update: {},
    create: {
      name: "Icône Groupe Thiès",
      address: "Thiès, Sénégal",
      latitude: 14.8038,
      longitude: -16.9248,
      radius: 50,
      qrCode: initialQrCode,
      qrSecret: qrSecret,
    },
  });

  // ─── 4. Horaires par défaut ────────────────────────────────────────────────
  console.log("Configuration des horaires par défaut...");
  
  const allDepts = await prisma.department.findMany();
  
  for (const dept of allDepts) {
    // Vérifier si un horaire existe déjà pour ce département
    const existingSchedule = await prisma.schedule.findFirst({
      where: { departmentId: dept.id }
    });

    if (!existingSchedule) {
      await prisma.schedule.create({
        data: {
          departmentId: dept.id,
          startTime: "08:00",
          endTime: "17:00",
          tolerance: 15, // 15 minutes
          workingDays: [1, 2, 3, 4, 5], // Lundi au Vendredi
        }
      });
    }
  }

  console.log("✅ Initialisation terminée avec succès !");
  console.log("--------------------------------------------------");
  console.log("🔑 Compte Administrateur par défaut :");
  console.log("Matricule : ICN001");
  console.log("Mot de passe : Admin@2026");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de l'initialisation :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
