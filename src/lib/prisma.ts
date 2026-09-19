import { PrismaClient } from "@prisma/client";

// Empêche la multiplication des instances de Prisma Client en développement
// lors des rechargements à chaud (HMR) de Next.js
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Décommente la ligne suivante pour afficher les requêtes SQL dans la console
    // log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
