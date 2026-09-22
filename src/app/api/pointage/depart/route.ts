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

    const { latitude, longitude, accuracy, deviceId } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({ message: "Données GPS manquantes" }, { status: 400 });
    }

    if (!deviceId) {
      return NextResponse.json({ message: "Identifiant de l'appareil introuvable." }, { status: 400 });
    }

    // --- VÉRIFICATION DE L'APPAREIL ---
    const existingDevice = await prisma.device.findUnique({
      where: { deviceIdentifier: deviceId },
    });

    if (existingDevice) {
      if (existingDevice.userId !== userId) {
        return NextResponse.json({ message: "Ce téléphone est déjà lié à un autre employé." }, { status: 403 });
      }
      if (existingDevice.status === "BLOQUE") {
        return NextResponse.json({ message: "Cet appareil a été bloqué." }, { status: 403 });
      }
      await prisma.device.update({ where: { id: existingDevice.id }, data: { lastSeen: new Date() } });
    } else {
      await prisma.device.create({
        data: { userId, deviceIdentifier: deviceId, deviceName: req.headers.get("user-agent")?.substring(0, 50) || "Téléphone inconnu" }
      });
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

    // --- GESTION DU DÉPART ANTICIPÉ ---
    const now = new Date();
    
    // Récupérer l'utilisateur pour vérifier son rôle et horaire
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: { include: { schedules: true } } }
    });

    const isExempt = 
      user?.role === "SUPER_ADMIN" || 
      user?.role === "ADMIN" || 
      user?.role === "SUPERVISEUR" ||
      user?.poste?.toUpperCase().includes("DIRECTEUR") ||
      user?.poste?.toUpperCase().includes("CHEF") ||
      user?.poste?.toUpperCase().includes("RESPONSABLE");

    let finalStatus = attendance.status;

    if (!isExempt) {
      const schedule = user?.department?.schedules[0];
      const endTimeStr = schedule?.endTime || "17:00";
      const [eh, em] = endTimeStr.split(':').map(Number);
      
      const expectedEndTime = new Date();
      expectedEndTime.setHours(eh, em, 0, 0);

      // Si le départ se fait avant l'heure prévue (ex: avant 17:00)
      if (now.getTime() < expectedEndTime.getTime()) {
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Vérifier si l'employé a une demande de type PERMISSION_DEPART approuvée pour aujourd'hui
        const permission = await prisma.leaveRequest.findFirst({
          where: {
            userId: userId,
            status: "APPROUVE",
            type: "PERMISSION_DEPART", // Uniquement ce type débloque le départ anticipé
            startDate: { lte: todayEnd },
            endDate: { gte: todayStart }
          }
        });

        if (!permission) {
          return NextResponse.json({ 
            message: `Vous ne pouvez pas partir avant ${endTimeStr}. Si vous avez besoin de partir tôt, soumettez une "Permission de départ anticipé" dans le module Congés et attendez l'approbation de la Direction.` 
          }, { status: 403 });
        }
        
        // S'il a une permission, on met à jour son statut pour l'historique
        finalStatus = permission.type === "MISSION" ? "MISSION" : "PERMISSION";
      }
    }
    // --- FIN GESTION DÉPART ANTICIPÉ ---

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
        status: finalStatus,
      }
    });

    await logAudit(userId, AUDIT_ACTIONS.CHECK_OUT, "Pointage départ réussi", { distance, finalStatus });

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
