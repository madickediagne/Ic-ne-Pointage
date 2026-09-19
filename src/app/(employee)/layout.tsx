export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barre de navigation supérieure simplifiée pour le moment */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold text-primary-800 text-lg">Icône Pointage</h1>
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
          ME {/* Initiales mockées */}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 p-4 pb-24 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Navigation mobile en bas */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 pb-safe z-10">
        <div className="flex flex-col items-center text-primary-600">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] mt-1 font-medium">Accueil</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-xl">📷</span>
          <span className="text-[10px] mt-1 font-medium">Pointer</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-xl">🕒</span>
          <span className="text-[10px] mt-1 font-medium">Historique</span>
        </div>
      </nav>
    </div>
  );
}
