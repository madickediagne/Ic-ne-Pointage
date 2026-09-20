import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// GET : Tous les horaires avec les infos de département
export async function GET() {
  try {
    await requireAdmin();
    const schedules = await prisma.schedule.findMany({
      include: {
        department: {
          select: { id: true, name: true, status: true },
        },
      },
      orderBy: { department: { name: "asc" } },
    });
    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
