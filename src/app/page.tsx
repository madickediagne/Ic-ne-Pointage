export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-primary-50">
      <div className="bg-white p-8 rounded-2xl shadow-card text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary-900 mb-4">Icône Pointage</h1>
        <p className="text-gray-600 mb-8">
          L'application est en cours de configuration. Les fondations et la base de données sont prêtes !
        </p>
        <div className="animate-pulse flex space-x-4 justify-center">
          <div className="rounded-full bg-primary-400 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1 max-w-32">
            <div className="h-2 bg-primary-400 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-primary-400 rounded col-span-2"></div>
                <div className="h-2 bg-primary-400 rounded col-span-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
