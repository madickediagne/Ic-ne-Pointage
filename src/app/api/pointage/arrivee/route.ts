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

    // 4. Récupérer les horaires du département pour calculer le retard
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: { include: { schedules: true } } }
    });

    let lateMinutes = 0;
    let status = "PRESENT";

    // Calcul simple du retard si un horaire existe
    const schedule = user?.department?.schedules[0];
    if (schedule) {
      const now = new Date();
      const [sh, sm] = schedule.startTime.split(':').map(Number);
      
      const expectedTime = new Date();
      expectedTime.setHours(sh, sm, 0, 0);
      
      const toleranceMs = schedule.tolerance * 60000;
      
      // Si l'heure actuelle > heure prévue + tolérance
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

    await logAudit(userId, AUDIT_ACTIONS.CHECK_IN, "Pointage arrivée réussi", { distance, lateMinutes });

    return NextResponse.json({ 
      success: true, 
      message: "Arrivée enregistrée avec succès !",
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
