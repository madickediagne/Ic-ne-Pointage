"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On utilise le moteur de base au lieu de l'interface par défaut
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    // Démarrer directement avec la caméra arrière (environment)
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      (decodedText) => {
        // En cas de succès : on arrête la caméra
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
          onScanSuccess(decodedText);
        }).catch(console.error);
      },
      (errorMessage) => {
        // Erreurs mineures ignorées (flou, etc.)
      }
    ).catch((err) => {
      console.error("Erreur caméra:", err);
      setError("Impossible d'ouvrir la caméra. Veuillez autoriser l'accès.");
    });

    // Nettoyage (si on quitte la page)
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-sm border border-gray-200 bg-black p-2">
      <div id="qr-reader" className="w-full rounded-xl overflow-hidden min-h-[250px] bg-black flex items-center justify-center">
        {!error && <div className="text-white text-sm animate-pulse">Ouverture de la caméra...</div>}
      </div>
      {error && (
        <div className="bg-white p-3 mt-2 rounded-xl text-red-500 text-sm font-medium text-center">
          {error}
        </div>
      )}
    </div>
  );
}
