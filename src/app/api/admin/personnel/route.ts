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

    const cleanMatricule = matricule.trim().toUpperCase();

    // 1. Vérifier si le matricule est déjà utilisé
    const existingMatricule = await prisma.user.findUnique({ where: { matricule: cleanMatricule } });
    if (existingMatricule) {
      return NextResponse.json({ error: `Le matricule ${cleanMatricule} est déjà attribué.` }, { status: 400 });
    }

    // 2. Vérifier si l'email est déjà utilisé (si renseigné)
    if (email && email.trim()) {
      const existingEmail = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (existingEmail) {
        return NextResponse.json({ error: `L'adresse email ${email} est déjà utilisée.` }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        matricule: cleanMatricule,
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email && email.trim() ? email.trim() : null,
        telephone: telephone && telephone.trim() ? telephone.trim() : null,
        poste: poste && poste.trim() ? poste.trim() : null,
        role: role || "EMPLOYE",
        departmentId: departmentId && departmentId.trim() ? departmentId.trim() : null,
        passwordHash,
        status: "ACTIF",
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur création employé:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la création de l'employé." },
      { status: 500 }
    );
  }
}
