import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { todayISO } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireAuth();
    
    // Convertir la date du jour en objet Date
    const today = new Date(todayISO());

    // Chercher s'il y a un enregistrement aujourd'hui pour cet employé
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      include: {
        site: { select: { name: true } }
      }
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
