import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdminRole, type Role } from "@/config/roles";

/**
 * Récupère la session courante côté serveur
 */
export async function getSession() {
  return await auth();
}

/**
 * Protège une route : redirige vers /login si l'utilisateur n'est pas connecté.
 * Retourne la session si connecté.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Protège une route admin : redirige si non connecté ou si le rôle n'a pas accès à l'admin.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  
  if (!isAdminRole(session.user.role as Role)) {
    redirect("/dashboard");
  }
  
  return session;
}
