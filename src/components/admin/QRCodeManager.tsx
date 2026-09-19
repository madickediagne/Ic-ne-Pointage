"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QRCodeDisplay({ qrString, siteName }: { qrString: string, siteName: string }) {
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    if (qrString) {
      QRCode.toDataURL(qrString, { width: 300, margin: 2, color: { dark: '#1e3a8a', light: '#ffffff' } })
        .then(url => setQrSrc(url))
        .catch(err => console.error(err));
    }
  }, [qrString]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{siteName}</h3>
      <p className="text-gray-500 mb-6 text-sm">Affichez ce QR code à l'entrée de l'établissement</p>
      
      {qrSrc ? (
        <img src={qrSrc} alt="QR Code" className="w-64 h-64 shadow-md rounded-xl" />
      ) : (
        <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      )}

      <div className="mt-8 flex gap-4">
        <a 
          href={qrSrc} 
          download={`QR-${siteName.replace(/\s+/g, '-')}.png`}
          className="px-6 py-2 bg-primary-600 text-white rounded-xl shadow hover:bg-primary-700 transition"
        >
          Télécharger
        </a>
      </div>
    </div>
  );
}
