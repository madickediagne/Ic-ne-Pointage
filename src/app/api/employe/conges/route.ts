import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

// GET : Liste des demandes de congé de l'employé
export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const demandes = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ demandes });
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}

// POST : Créer une nouvelle demande de congé
export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const body = await req.json();

    const { type, startDate, endDate, reason } = body;

    if (!type || !startDate || !endDate) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);

    if (eDate < sDate) {
      return NextResponse.json({ error: "La date de fin ne peut pas être avant la date de début." }, { status: 400 });
    }

    const demande = await prisma.leaveRequest.create({
      data: {
        userId,
        type,
        startDate: sDate,
        endDate: eDate,
        reason: reason || null,
        status: "EN_ATTENTE",
      },
    });

    return NextResponse.json({ success: true, demande }, { status: 201 });
  } catch (error) {
    console.error("Erreur création demande congé:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
