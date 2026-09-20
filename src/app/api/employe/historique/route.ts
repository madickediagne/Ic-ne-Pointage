import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

// GET : Historique des pointages de l'employé connecté (les 30 derniers jours par défaut)
export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const attendances = await prisma.attendance.findMany({
      where: { userId },
      include: {
        site: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
      take: 31,
    });

    return NextResponse.json({ attendances });
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
