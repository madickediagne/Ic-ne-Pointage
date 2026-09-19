import { prisma } from "@/lib/prisma";
import QRCodeDisplay from "@/components/admin/QRCodeManager";

export default async function QRCodePage() {
  // On récupère le site de Thiès
  const site = await prisma.site.findFirst();

  if (!site || !site.qrCode) {
    return <div className="p-4">Site ou QR Code introuvable.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion du QR Code</h2>
        <p className="text-gray-500">Gérez le QR Code utilisé par les employés pour pointer.</p>
      </div>

      <div className="max-w-md mx-auto mt-10">
        <QRCodeDisplay qrString={site.qrCode} siteName={site.name} />
      </div>
    </div>
  );
}
