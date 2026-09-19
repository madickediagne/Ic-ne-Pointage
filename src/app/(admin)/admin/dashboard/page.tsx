import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // Petit mock des statistiques (plus tard via route API)
  const usersCount = await prisma.user.count({ where: { status: "ACTIF" } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Vue d'ensemble</h1>
        <div className="text-sm text-gray-500">
          Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Effectif total</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{usersCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
          <p className="text-sm font-medium text-green-600">Présents</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
          <p className="text-sm font-medium text-orange-600">Retards</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
          <p className="text-sm font-medium text-red-600">Absents</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
        </div>
      </div>

      {/* Section activité récente (placeholder) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Pointages récents</h3>
        <p className="text-gray-500 text-sm">Le système de pointage sera activé à la prochaine étape.</p>
      </div>
    </div>
  );
}
