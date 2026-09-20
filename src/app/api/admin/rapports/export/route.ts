import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { formatTime } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "quotidien"; // "quotidien" | "mensuel"
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const now = new Date();
    const defaultMois = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const moisStr = searchParams.get("mois") || defaultMois;
    const departmentId = searchParams.get("departmentId");

    const userWhere: any = {
      status: "ACTIF",
      role: { not: "SUPER_ADMIN" },
    };
    if (departmentId) userWhere.departmentId = departmentId;

    const employes = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        matricule: true,
        prenom: true,
        nom: true,
        poste: true,
        department: { select: { name: true } },
      },
      orderBy: [{ departmentId: "asc" }, { nom: "asc" }],
    });

    let csvContent = "";
    let filename = "";

    if (type === "quotidien") {
      filename = `pointage_quotidien_${dateStr}.csv`;
      const targetDate = new Date(dateStr);
      targetDate.setHours(0, 0, 0, 0);

      const pointages = await prisma.attendance.findMany({
        where: {
          date: targetDate,
          user: userWhere,
        },
        include: { site: true },
      });

      const map = new Map(pointages.map((p) => [p.userId, p]));

      // En-têtes CSV
      csvContent = "Matricule;Prénom;Nom;Département;Poste;Statut;Heure Arrivée;Heure Départ;Retard (min);Site\n";

      employes.forEach((e) => {
        const pt = map.get(e.id);
        const statut = pt ? pt.status : "ABSENT";
        const arrivee = pt?.checkIn ? formatTime(pt.checkIn) : "--:--";
        const depart = pt?.checkOut ? formatTime(pt.checkOut) : "--:--";
        const retard = pt ? pt.lateMinutes : 0;
        const site = pt?.site?.name || "—";

        csvContent += `"${e.matricule}";"${e.prenom}";"${e.nom}";"${e.department?.name || "—"}";"${e.poste || "—"}";"${statut}";"${arrivee}";"${depart}";${retard};"${site}"\n`;
      });
    } else {
      // Export Mensuel
      filename = `pointage_mensuel_${moisStr}.csv`;
      const [year, month] = moisStr.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const pointages = await prisma.attendance.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          user: userWhere,
        },
      });

      // En-têtes CSV
      csvContent = "Matricule;Prénom;Nom;Département;Poste;Jours Présents;Jours avec Retard;Total Retard (min);Heures Travaillées (h)\n";

      employes.forEach((e) => {
        const empPts = pointages.filter((p) => p.userId === e.id);
        const joursPresents = empPts.length;
        const joursRetard = empPts.filter((p) => p.lateMinutes > 0 || p.status === "RETARD").length;
        const totalRetard = empPts.reduce((acc, p) => acc + (p.lateMinutes || 0), 0);

        let totalHeures = 0;
        empPts.forEach((p) => {
          if (p.checkIn && p.checkOut) {
            const diff = new Date(p.checkOut).getTime() - new Date(p.checkIn).getTime();
            if (diff > 0) totalHeures += diff / (1000 * 60 * 60);
          }
        });

        csvContent += `"${e.matricule}";"${e.prenom}";"${e.nom}";"${e.department?.name || "—"}";"${e.poste || "—"}";${joursPresents};${joursRetard};${totalRetard};${Math.round(totalHeures * 10) / 10}\n`;
      });
    }

    // Ajout du BOM UTF-8 (\uFEFF) pour compatibilité parfaite avec Microsoft Excel
    const bomCsv = "\uFEFF" + csvContent;

    return new Response(bomCsv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erreur export CSV:", error);
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
  }
}
