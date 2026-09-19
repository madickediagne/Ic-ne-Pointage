"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartedRef = useRef(false); // Protection contre le double montage (React StrictMode)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si déjà démarré (double montage en StrictMode), on ne fait rien
    if (isStartedRef.current) return;
    isStartedRef.current = true;

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10 },
      (decodedText) => {
        // Succès : on arrête proprement la caméra avant de remonter le résultat
        html5QrCode.stop()
          .then(() => {
            isStartedRef.current = false;
            onScanSuccess(decodedText);
          })
          .catch(console.error);
      },
      () => {
        // Erreurs de scan mineures ignorées silencieusement
      }
    ).catch((err) => {
      console.error("Erreur caméra:", err);
      setError("Impossible d'ouvrir la caméra. Vérifiez les permissions.");
      isStartedRef.current = false;
    });

    // Nettoyage propre si le composant se démonte
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop()
          .then(() => { isStartedRef.current = false; })
          .catch(console.error);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-black">
      <div
        id="qr-reader"
        className="w-full min-h-[300px] flex items-center justify-center"
      >
        {!error && (
          <p className="text-white text-sm animate-pulse px-4 text-center">
            📷 Ouverture de la caméra...
          </p>
        )}
      </div>
      {error && (
        <div className="bg-white p-3 text-red-500 text-sm font-medium text-center">
          {error}
        </div>
      )}
    </div>
  );
}
