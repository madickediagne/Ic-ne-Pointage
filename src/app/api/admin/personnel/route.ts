import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import bcrypt from "bcryptjs";

// GET : liste de tout le personnel
export async function GET() {
  try {
    await requireAdmin();
    const personnel = await prisma.user.findMany({
      where: { role: { not: "SUPER_ADMIN" } },
      include: { department: { select: { id: true, name: true } } },
      orderBy: [{ status: "asc" }, { nom: "asc" }],
    });
    return NextResponse.json({ personnel });
  } catch (error) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}

// POST : créer un nouvel employé
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { matricule, nom, prenom, email, telephone, poste, role, departmentId, password } = body;

    if (!matricule || !nom || !prenom || !password) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    // Vérifier si le matricule est déjà utilisé
    const existing = await prisma.user.findUnique({ where: { matricule: matricule.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "Ce matricule est déjà utilisé." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        matricule: matricule.toUpperCase(),
        nom,
        prenom,
        email: email || null,
        telephone: telephone || null,
        poste: poste || null,
        role: role || "EMPLOYE",
        departmentId: departmentId || null,
        passwordHash,
        status: "ACTIF",
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
