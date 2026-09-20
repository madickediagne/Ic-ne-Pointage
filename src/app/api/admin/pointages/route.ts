import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// GET : Liste paginée/filtrée des pointages pour l'administration
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const departmentId = searchParams.get("departmentId");

    const where: any = {};

    if (dateParam) {
      const d = new Date(dateParam);
      d.setHours(0, 0, 0, 0);
      where.date = d;
    }

    if (departmentId) {
      where.user = { departmentId };
    }

    const pointages = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            matricule: true,
            department: { select: { name: true } },
          },
        },
        site: { select: { name: true } },
      },
      orderBy: [{ date: "desc" }, { checkIn: "desc" }],
      take: 100,
    });

    return NextResponse.json({ pointages });
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
