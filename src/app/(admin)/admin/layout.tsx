import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sécurité renforcée côté serveur : seuls les rôles ADMIN y accèdent
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-bold text-primary-800 text-xl">Admin Icône</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="block px-4 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium">Dashboard</Link>
          <Link href="/admin/personnel" className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">Personnel</Link>
          <Link href="/admin/pointages" className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">Pointages</Link>
          <Link href="/admin/site" className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">Site & QR</Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
            <span>← Retour app employé</span>
          </Link>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
          <h2 className="font-semibold text-gray-800">Administration</h2>
          {/* Header droit mocké */}
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs">
            AD
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
