import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { calculateDistance } from "@/lib/distance";
import { todayISO } from "@/lib/utils";
import { AUDIT_ACTIONS } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const body = await req.json();

    const { qrCode, latitude, longitude, accuracy } = body;

    if (!qrCode || !latitude || !longitude) {
      return NextResponse.json({ message: "Données GPS ou QR manquantes" }, { status: 400 });
    }

    const today = new Date(todayISO());

    // 1. Vérifier si l'utilisateur a déjà pointé
    const existing = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing?.checkIn) {
      return NextResponse.json({ message: "Vous avez déjà pointé votre arrivée aujourd'hui." }, { status: 400 });
    }

    // 2. Vérifier le QR Code (doit correspondre à un site actif)
    const site = await prisma.site.findUnique({
      where: { qrCode: qrCode },
    });

    if (!site || site.status !== "ACTIF") {
      await logAudit(userId, AUDIT_ACTIONS.CHECK_IN_REFUSED, "QR Code invalide ou inactif", { qrCode });
      return NextResponse.json({ message: "Ce QR Code n'est pas reconnu ou est désactivé." }, { status: 400 });
    }

    // 3. Vérifier la distance GPS (Anti-fraude)
    const distance = calculateDistance(latitude, longitude, site.latitude, site.longitude);
    
    if (distance > site.radius) {
      await logAudit(userId, AUDIT_ACTIONS.CHECK_IN_REFUSED, "Hors zone", { distance, radius: site.radius });
      return NextResponse.json(
        { message: `Vous êtes en dehors de la zone autorisée (${Math.round(distance)}m > ${site.radius}m).` }, 
        { status: 403 }
      );
    }

    // 4. Récupérer l'utilisateur, son poste et les horaires de son département
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: { include: { schedules: true } } }
    });

    let lateMinutes = 0;
    let status = "PRESENT";

    // RÈGLE : Les Directeurs, Chefs de département et Administrateurs ne sont pas soumis au calcul de retard
    const isExempt = 
      user?.role === "SUPER_ADMIN" || 
      user?.role === "ADMIN" || 
      user?.role === "SUPERVISEUR" ||
      user?.poste?.toUpperCase().includes("DIRECTEUR") ||
      user?.poste?.toUpperCase().includes("CHEF") ||
      user?.poste?.toUpperCase().includes("RESPONSABLE");

    if (!isExempt) {
      // Horaire du département ou horaire standard Icône Groupe (08:00 avec 15 min de tolérance)
      const schedule = user?.department?.schedules[0];
      const startTime = schedule?.startTime || "08:00";
      const tolerance = schedule?.tolerance ?? 15;

      const now = new Date();
      const [sh, sm] = startTime.split(':').map(Number);
      
      const expectedTime = new Date();
      expectedTime.setHours(sh, sm, 0, 0);
      
      const toleranceMs = tolerance * 60000;
      
      // Si l'heure actuelle dépasse l'heure prévue + la tolérance (ex: 08:15)
      if (now.getTime() > expectedTime.getTime() + toleranceMs) {
        lateMinutes = Math.floor((now.getTime() - expectedTime.getTime()) / 60000);
        status = "RETARD";
      }
    }

    // 5. Enregistrer l'arrivée
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        siteId: site.id,
        date: today,
        checkIn: new Date(),
        checkInLatitude: latitude,
        checkInLongitude: longitude,
        checkInAccuracy: accuracy,
        lateMinutes,
        status,
      }
    });

    await logAudit(userId, AUDIT_ACTIONS.CHECK_IN, "Pointage arrivée réussi", { distance, lateMinutes, isExempt });

    return NextResponse.json({ 
      success: true, 
      message: status === "RETARD" 
        ? `Arrivée enregistrée avec ${lateMinutes} min de retard.` 
        : "Arrivée enregistrée à l'heure avec succès !",
      attendance 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

async function logAudit(userId: string, action: string, metadataString: string, data: any) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: JSON.stringify({ note: metadataString, ...data })
      }
    });
  } catch(e) {}
}
