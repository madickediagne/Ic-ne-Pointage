import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-card text-center max-w-md w-full mx-4 border border-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 tracking-tight">Icône Pointage</h1>
        <p className="text-gray-500 mt-2 text-sm">Veuillez vous connecter pour accéder à votre espace.</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-sm text-gray-400">
        <p>En cas d'oubli de mot de passe,</p>
        <p>veuillez contacter l'administration.</p>
      </div>
    </div>
  );
}
