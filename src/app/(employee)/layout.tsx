import Link from "next/link";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name || "Employé";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barre de navigation supérieure */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-xs">
        <Link href="/dashboard" className="font-bold text-primary-900 text-lg">
          Icône Pointage
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
            {initials || "EM"}
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 p-4 pb-24 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Navigation mobile en bas avec vrais liens */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around p-2.5 pb-safe z-20 shadow-md">
        <Link
          href="/dashboard"
          className="flex flex-col items-center text-gray-600 hover:text-primary-600 transition px-4 py-1"
        >
          <span className="text-xl">🏠</span>
          <span className="text-[11px] mt-0.5 font-medium">Accueil</span>
        </Link>
        <Link
          href="/pointer"
          className="flex flex-col items-center text-primary-600 px-4 py-1"
        >
          <span className="text-xl">📷</span>
          <span className="text-[11px] mt-0.5 font-semibold">Pointer</span>
        </Link>
        <Link
          href="/historique"
          className="flex flex-col items-center text-gray-600 hover:text-primary-600 transition px-4 py-1"
        >
          <span className="text-xl">🕒</span>
          <span className="text-[11px] mt-0.5 font-medium">Historique</span>
        </Link>
      </nav>
    </div>
  );
}
