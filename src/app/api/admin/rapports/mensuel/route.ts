import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// GET : Rapport mensuel pour un mois donné (format YYYY-MM)
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const defaultMois = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const moisStr = searchParams.get("mois") || defaultMois;
    const departmentId = searchParams.get("departmentId");

    const [year, month] = moisStr.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Liste des employés concernés
    const userWhere: any = {
      status: "ACTIF",
      role: { not: "SUPER_ADMIN" },
    };
    if (departmentId) {
      userWhere.departmentId = departmentId;
    }

    const employes = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        matricule: true,
        prenom: true,
        nom: true,
        poste: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ departmentId: "asc" }, { nom: "asc" }],
    });

    // 2. Pointages du mois
    const pointages = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        user: userWhere,
      },
    });

    // 3. Calcul des statistiques par employé
    const statsParEmploye = employes.map((emp) => {
      const empPointages = pointages.filter((p) => p.userId === emp.id);

      const joursPresents = empPointages.length;
      const joursRetard = empPointages.filter((p) => p.lateMinutes > 0 || p.status === "RETARD").length;
      const totalMinutesRetard = empPointages.reduce((sum, p) => sum + (p.lateMinutes || 0), 0);

      // Calcul des heures totales travaillées (si checkIn et checkOut présents)
      let totalHeures = 0;
      empPointages.forEach((p) => {
        if (p.checkIn && p.checkOut) {
          const diffMs = new Date(p.checkOut).getTime() - new Date(p.checkIn).getTime();
          if (diffMs > 0) {
            totalHeures += diffMs / (1000 * 60 * 60);
          }
        }
      });

      return {
        id: emp.id,
        matricule: emp.matricule,
        nom: emp.nom,
        prenom: emp.prenom,
        poste: emp.poste,
        departement: emp.department?.name || "—",
        joursPresents,
        joursRetard,
        totalMinutesRetard,
        totalHeuresTravaillées: Math.round(totalHeures * 10) / 10,
      };
    });

    return NextResponse.json({
      mois: moisStr,
      totalEmployes: employes.length,
      statistiques: statsParEmploye,
    });
  } catch (error) {
    console.error("Erreur rapport mensuel:", error);
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
