import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// GET : Liste de tous les départements pour les formulaires
export async function GET() {
  try {
    await requireAdmin();
    const departements = await prisma.department.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
    return NextResponse.json({ departements });
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
