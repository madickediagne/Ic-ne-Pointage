export default function LoginLoading() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-card text-center max-w-md w-full mx-4 flex flex-col items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-500">Chargement...</p>
    </div>
  );
}
