"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialisation du scanner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Succès : on arrête le scanner et on renvoie le résultat
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
        onScanSuccess(decodedText);
      },
      (err) => {
        // Erreurs mineures de scan (flou, etc.), on ignore silencieusement
      }
    );

    // Nettoyage au démontage du composant
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-sm border border-gray-200 bg-white p-2">
      <div id="qr-reader" className="w-full" />
      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
    </div>
  );
}
