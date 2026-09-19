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

    const { latitude, longitude, accuracy } = body;

    // Le QR n'est pas strictement obligatoire pour le départ si on a le GPS (selon les règles de l'entreprise),
    // mais on vérifie le GPS pour s'assurer qu'il part bien du site.
    if (!latitude || !longitude) {
      return NextResponse.json({ message: "Données GPS manquantes" }, { status: 400 });
    }

    const today = new Date(todayISO());

    // 1. Vérifier si l'utilisateur a pointé son arrivée
    const attendance = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
      include: { site: true }
    });

    if (!attendance || !attendance.checkIn) {
      return NextResponse.json({ message: "Vous n'avez pas enregistré d'arrivée aujourd'hui." }, { status: 400 });
    }

    if (attendance.checkOut) {
      return NextResponse.json({ message: "Vous avez déjà pointé votre départ." }, { status: 400 });
    }

    // 2. Vérifier le GPS (il doit toujours être sur le site pour partir)
    const site = attendance.site;
    const distance = calculateDistance(latitude, longitude, site.latitude, site.longitude);
    
    if (distance > site.radius) {
      // Optionnel: on peut autoriser le départ hors zone (ex: mission), mais pour la V1 on bloque
      await prisma.auditLog.create({
        data: { userId, action: AUDIT_ACTIONS.CHECK_OUT_REFUSED, metadata: JSON.stringify({ distance, radius: site.radius }) }
      });
      return NextResponse.json(
        { message: `Vous êtes en dehors de la zone du site (${Math.round(distance)}m). Rapprochez-vous pour pointer votre départ.` }, 
        { status: 403 }
      );
    }

    // 3. Enregistrer le départ
    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
        checkOutLatitude: latitude,
        checkOutLongitude: longitude,
        checkOutAccuracy: accuracy,
      }
    });

    await prisma.auditLog.create({
      data: { userId, action: AUDIT_ACTIONS.CHECK_OUT, metadata: JSON.stringify({ distance }) }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Départ enregistré avec succès !",
      attendance: updated 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
