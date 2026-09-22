import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import bcrypt from "bcryptjs";

// PUT : Modifier son propre profil (matricule + mot de passe)
export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const body = await req.json();
    const { matricule, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Vérifier le mot de passe actuel (obligatoire pour toute modification)
    if (!currentPassword) {
      return NextResponse.json({ error: "Le mot de passe actuel est requis pour modifier le profil." }, { status: 400 });
    }

    const passwordOk = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 403 });
    }

    const updateData: any = {};

    // Changement de matricule
    if (matricule && matricule !== user.matricule) {
      const existing = await prisma.user.findUnique({ where: { matricule } });
      if (existing) {
        return NextResponse.json({ error: "Ce matricule est déjà utilisé par quelqu'un d'autre." }, { status: 400 });
      }
      updateData.matricule = matricule;
    }

    // Changement de mot de passe
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Aucune modification détectée." }, { status: 400 });
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès. Veuillez vous reconnecter si vous avez changé votre matricule.",
      matriculeChanged: !!updateData.matricule,
    });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
