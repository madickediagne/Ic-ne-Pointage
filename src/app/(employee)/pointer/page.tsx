"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import QRScanner from "@/components/pointage/QRScanner";
import { formatTime } from "@/lib/utils";

export default function PointerPage() {
  const router = useRouter();
  
  // États
  const [status, setStatus] = useState<"LOADING" | "NEED_CHECKIN" | "NEED_CHECKOUT" | "DONE">("LOADING");
  const [attendance, setAttendance] = useState<any>(null);
  
  const [step, setStep] = useState<"INIT" | "GPS" | "QR" | "PROCESSING" | "RESULT">("INIT");
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [scannedQR, setScannedQR] = useState<string | null>(null);

  const { latitude, longitude, accuracy, error: gpsError, loading: gpsLoading, getLocation } = useGeolocation();

  // 1. Au chargement, on vérifie l'état du pointage du jour
  useEffect(() => {
    fetch("/api/pointage/statut")
      .then(res => res.json())
      .then(data => {
        if (!data.attendance || !data.attendance.checkIn) {
          setStatus("NEED_CHECKIN");
        } else if (!data.attendance.checkOut) {
          setStatus("NEED_CHECKOUT");
          setAttendance(data.attendance);
        } else {
          setStatus("DONE");
          setAttendance(data.attendance);
        }
      });
  }, []);

  // 2. Déclencher le processus de pointage
  const handleStartPointage = () => {
    setStep("GPS");
    getLocation(); // Lance la géolocalisation
  };

  // 3. Quand le GPS est prêt, on passe TOUJOURS au scanner QR (arrivée ET départ)
  useEffect(() => {
    if (step === "GPS" && latitude && longitude) {
      setStep("QR"); // QR obligatoire pour l'arrivée ET le départ
    } else if (step === "GPS" && gpsError) {
      setMessage({ type: "error", text: gpsError });
      setStep("RESULT");
    }
  }, [latitude, longitude, gpsError, step, status]);

  // 4. Scanner réussi
  const handleScanSuccess = (decodedText: string) => {
    if (step === "QR") {
      setScannedQR(decodedText);
      submitPointage(decodedText);
    }
  };

  // 5. Envoi au serveur
  const submitPointage = async (qrData: string | null) => {
    setStep("PROCESSING");
    setMessage(null);

    const endpoint = status === "NEED_CHECKIN" ? "/api/pointage/arrivee" : "/api/pointage/depart";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: qrData,
          latitude,
          longitude,
          accuracy,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setAttendance(data.attendance);
        setStatus(status === "NEED_CHECKIN" ? "NEED_CHECKOUT" : "DONE");
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors du pointage." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Problème de connexion avec le serveur." });
    }
    setStep("RESULT");
  };

  // Affichages selon les étapes
  if (status === "LOADING") return <div className="p-8 text-center">Chargement des données...</div>;
  if (status === "DONE" && step === "INIT") {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
        <h2 className="text-xl font-bold text-gray-800">Journée terminée</h2>
        <p className="text-gray-500 mt-2">Vous avez pointé votre arrivée et votre départ.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-6 px-6 py-2 bg-gray-100 rounded-xl">Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-primary-900 mb-2">
          Pointage de {status === "NEED_CHECKIN" ? "l'arrivée" : "départ"}
        </h2>
        {attendance?.checkIn && (
          <p className="text-sm text-gray-500">Arrivé à : {formatTime(attendance.checkIn)}</p>
        )}
      </div>

      {step === "INIT" && (
        <button 
          onClick={handleStartPointage}
          className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-md hover:bg-primary-700 transition active:scale-95"
        >
          {status === "NEED_CHECKIN" ? "Pointer mon arrivée" : "Pointer mon départ"}
        </button>
      )}

      {step === "GPS" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <div className="animate-pulse flex flex-col items-center">
            <span className="text-4xl mb-4">📍</span>
            <p className="font-medium text-gray-700">Recherche de votre position...</p>
            <p className="text-sm text-gray-500 mt-2">Veuillez autoriser l'accès au GPS.</p>
          </div>
        </div>
      )}

      {step === "QR" && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 text-center">
            Position GPS trouvée (précision: {Math.round(accuracy || 0)}m). <br/> Scannez maintenant le QR Code à l'entrée.
          </div>
          <QRScanner onScanSuccess={handleScanSuccess} />
        </div>
      )}

      {step === "PROCESSING" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="font-medium text-gray-700">Validation en cours...</p>
        </div>
      )}

      {step === "RESULT" && message && (
        <div className={`p-6 rounded-2xl text-center ${message.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className="text-4xl mb-3">{message.type === "success" ? "✅" : "❌"}</div>
          <h3 className={`font-bold text-lg ${message.type === "success" ? "text-green-800" : "text-red-800"}`}>
            {message.type === "success" ? "Succès" : "Pointage refusé"}
          </h3>
          <p className={`mt-2 ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>
            {message.text}
          </p>
          
          <div className="mt-6 space-x-3">
            {message.type === "error" && (
              <button onClick={() => setStep("INIT")} className="px-4 py-2 bg-white rounded-xl font-medium text-gray-700 shadow-sm border border-gray-200">
                Réessayer
              </button>
            )}
            <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-primary-600 rounded-xl font-medium text-white shadow-sm">
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
