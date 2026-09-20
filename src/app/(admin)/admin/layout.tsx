import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const userName = session.user.name || "Admin";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-bold text-primary-900 text-xl tracking-tight">
            Icône Pointage
          </h1>
          <p className="text-xs text-primary-600 font-medium mt-0.5">Espace Administration</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
          >
            <span>📊</span> Dashboard
          </Link>
          <Link
            href="/admin/personnel"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
          >
            <span>👥</span> Personnel
          </Link>
          <Link
            href="/admin/pointages"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
          >
            <span>🕒</span> Pointages
          </Link>
          <Link
            href="/admin/site"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
          >
            <span>📍</span> Site & QR
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/dashboard"
            className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1.5 py-1"
          >
            <span>📱</span> Mode Employé (Pointer)
          </Link>
          <LogoutButton className="w-full text-center py-2 px-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition block" />
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between sticky top-0 z-10">
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
            Icône Groupe Thiès
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">
              Connecté : <strong className="text-gray-700">{userName}</strong>
            </span>
            <div className="md:hidden">
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
