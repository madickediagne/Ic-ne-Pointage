import { prisma } from "@/lib/prisma";
import Link from "next/link";
import QRCodeDisplay from "@/components/admin/QRCodeManager";

export default async function AdminSitePage() {
  const site = await prisma.site.findFirst();

  if (!site) {
    return <div className="p-6">Aucun site configuré.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration du Site</h1>
          <p className="text-gray-500 text-sm">
            Paramètres géographiques et QR code du site de pointage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Détails du site */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-800 border-b pb-3">Détails de l'emplacement</h2>
          
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Nom du site</span>
            <p className="text-base font-medium text-gray-800">{site.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-400 uppercase font-semibold">Latitude</span>
              <p className="text-base font-mono text-gray-800">{site.latitude}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase font-semibold">Longitude</span>
              <p className="text-base font-mono text-gray-800">{site.longitude}</p>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Rayon autorisé</span>
            <p className="text-base font-medium text-primary-700">{site.radius} mètres</p>
            <p className="text-xs text-gray-400 mt-1">
              Les employés doivent se trouver à moins de {site.radius}m du point pour pouvoir pointer.
            </p>
          </div>

          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Statut</span>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              {site.status}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div>
          <QRCodeDisplay qrString={site.qrCode} siteName={site.name} />
        </div>
      </div>
    </div>
  );
}
