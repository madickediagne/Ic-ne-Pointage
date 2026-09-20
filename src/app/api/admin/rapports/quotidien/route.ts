import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// GET : Rapport quotidien pour une date donnée
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const departmentId = searchParams.get("departmentId");

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    // 1. Tous les employés actifs
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

    // 2. Tous les pointages pour cette date
    const pointages = await prisma.attendance.findMany({
      where: {
        date: targetDate,
        user: userWhere,
      },
      include: {
        site: { select: { name: true } },
      },
    });

    const pointageMap = new Map(pointages.map((p) => [p.userId, p]));

    // 3. Synthèse par employé
    let presentsCount = 0;
    let retardsCount = 0;
    let absentsCount = 0;
    let totalRetardMinutes = 0;

    const details = employes.map((emp) => {
      const pt = pointageMap.get(emp.id);
      if (pt) {
        if (pt.status === "RETARD" || pt.lateMinutes > 0) {
          retardsCount++;
          totalRetardMinutes += pt.lateMinutes;
        } else {
          presentsCount++;
        }
        return {
          id: emp.id,
          matricule: emp.matricule,
          nom: emp.nom,
          prenom: emp.prenom,
          poste: emp.poste,
          departement: emp.department?.name || "—",
          statut: pt.status,
          checkIn: pt.checkIn,
          checkOut: pt.checkOut,
          lateMinutes: pt.lateMinutes,
          site: pt.site?.name || "—",
        };
      } else {
        absentsCount++;
        return {
          id: emp.id,
          matricule: emp.matricule,
          nom: emp.nom,
          prenom: emp.prenom,
          poste: emp.poste,
          departement: emp.department?.name || "—",
          statut: "ABSENT",
          checkIn: null,
          checkOut: null,
          lateMinutes: 0,
          site: "—",
        };
      }
    });

    const totalEmployes = employes.length;
    const tauxPresence = totalEmployes > 0 ? Math.round(((presentsCount + retardsCount) / totalEmployes) * 100) : 0;

    return NextResponse.json({
      date: dateStr,
      synthese: {
        totalEmployes,
        presents: presentsCount,
        retards: retardsCount,
        absents: absentsCount,
        totalRetardMinutes,
        tauxPresence,
      },
      details,
    });
  } catch (error) {
    console.error("Erreur rapport quotidien:", error);
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
