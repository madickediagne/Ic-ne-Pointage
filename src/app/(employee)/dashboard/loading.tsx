export default function EmployeeLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-500 text-sm">Chargement du tableau de bord...</p>
    </div>
  );
}
