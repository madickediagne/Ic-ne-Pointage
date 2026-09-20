import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// PUT : Modifier un horaire (startTime, endTime, tolerance)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { startTime, endTime, tolerance } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Heure de début et de fin obligatoires." },
        { status: 400 }
      );
    }

    // Validation format HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Format d'heure invalide (attendu: HH:mm)." },
        { status: 400 }
      );
    }

    const toleranceVal = Number(tolerance);
    if (isNaN(toleranceVal) || toleranceVal < 0 || toleranceVal > 60) {
      return NextResponse.json(
        { error: "La tolérance doit être entre 0 et 60 minutes." },
        { status: 400 }
      );
    }

    const updated = await prisma.schedule.update({
      where: { id: params.id },
      data: {
        startTime,
        endTime,
        tolerance: toleranceVal,
      },
      include: {
        department: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error: any) {
    console.error("Erreur mise à jour horaire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
