import { requireAuth } from "@/lib/session";
import Link from "next/link";
import { isAdminRole, type Role } from "@/config/roles";

export default async function EmployeeDashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">
          Bonjour, {session.user.name?.split(" ")[0] || "Employé"} 👋
        </h2>
        <p className="text-gray-500 mt-1">Bonne journée de travail !</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
          <span className="text-3xl">📍</span>
        </div>
        <h3 className="font-semibold text-gray-800">Prêt à commencer ?</h3>
        <p className="text-sm text-gray-500">N'oubliez pas d'enregistrer votre arrivée.</p>
        
        <Link 
          href="/pointer"
          className="w-full mt-2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition"
        >
          Scanner pour pointer
        </Link>
      </div>

      {isAdminRole(session.user.role as Role) && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-purple-800 mb-3">
            Vous êtes connecté en tant qu'administrateur.
          </p>
          <Link 
            href="/admin/dashboard"
            className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
          >
            Aller à l'administration
          </Link>
        </div>
      )}
    </div>
  );
}
