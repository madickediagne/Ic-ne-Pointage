import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import bcrypt from "bcryptjs";

// GET : détail d'un employé
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { department: true },
    });
    if (!user) return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}

// PUT : modifier un employé
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { nom, prenom, email, telephone, poste, role, departmentId, status, password } = body;

    const updateData: any = { nom, prenom, email, telephone, poste, role, status };
    if (departmentId) updateData.departmentId = departmentId;
    if (password && password.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : désactiver un employé (soft delete)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: params.id },
      data: { status: "INACTIF" },
    });
    return NextResponse.json({ success: true, message: "Employé désactivé." });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
