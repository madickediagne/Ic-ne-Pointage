import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Nombre total d'employés actifs
    const totalEmployes = await prisma.user.count({
      where: { status: "ACTIF", role: { not: "SUPER_ADMIN" } },
    });

    // Pointages d'aujourd'hui
    const pointagesAujourdhui = await prisma.attendance.findMany({
      where: { date: today },
      include: {
        user: {
          select: { prenom: true, nom: true, matricule: true, departmentId: true, department: { select: { name: true } } },
        },
        site: { select: { name: true } },
      },
      orderBy: { checkIn: "desc" },
    });

    const presents = pointagesAujourdhui.length;
    const retards = pointagesAujourdhui.filter((p) => p.status === "RETARD").length;
    const absents = totalEmployes - presents;
    const partis = pointagesAujourdhui.filter((p) => p.checkOut !== null).length;

    return NextResponse.json({
      stats: { totalEmployes, presents, retards, absents, partis },
      pointages: pointagesAujourdhui,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
