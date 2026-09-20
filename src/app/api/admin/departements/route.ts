import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// GET : Liste des départements ACTIFS pour les formulaires d'employés
export async function GET() {
  try {
    await requireAdmin();
    const departements = await prisma.department.findMany({
      where: { status: "ACTIF" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
    return NextResponse.json({ departements });
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
