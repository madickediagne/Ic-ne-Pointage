import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// PUT : Approuver ou refuser une demande
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const adminId = session.user.id;
    const body = await req.json();
    const { status } = body;

    if (!["APPROUVE", "REFUSE"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status,
        approvedBy: adminId,
      },
    });

    return NextResponse.json({ success: true, demande: updated });
  } catch (error) {
    console.error("Erreur màj demande congé:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
