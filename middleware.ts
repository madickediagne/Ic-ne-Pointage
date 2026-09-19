import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ROLES, ROLES } from "@/config/roles";
import type { Role } from "@/config/roles";

// ─── Routes publiques (accessibles sans connexion) ─────────────────────────
const PUBLIC_ROUTES = ["/login", "/offline"];

// ─── Routes réservées aux administrateurs ─────────────────────────────────
const ADMIN_ROUTE_PREFIX = "/admin";

// ─── Middleware principal ──────────────────────────────────────────────────
export default auth((req: NextRequest & { auth: { user?: { role?: Role } } | null }) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // ── 1. Laisser passer les routes publiques ──────────────────────────────
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // Si déjà connecté et tente d'aller sur /login → rediriger vers son espace
    if (session?.user && pathname === "/login") {
      const role = session.user.role as Role;
      const destination = ADMIN_ROLES.includes(role)
        ? "/admin/dashboard"
        : "/dashboard";
      return NextResponse.redirect(new URL(destination, nextUrl));
    }
    return NextResponse.next();
  }

  // ── 2. Pas de session → rediriger vers /login ───────────────────────────
  if (!session?.user) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = session.user.role as Role;

  // ── 3. Route admin → vérifier le rôle ──────────────────────────────────
  if (pathname.startsWith(ADMIN_ROUTE_PREFIX)) {
    if (!ADMIN_ROLES.includes(userRole)) {
      // Un employé simple n'a pas accès à l'espace admin → rediriger
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // ── 4. Route employé → accessible à tous les utilisateurs connectés ─────
  // Les admins peuvent aussi accéder à /dashboard (pour tester le pointage)
  return NextResponse.next();
});

// ─── Configuration des routes protégées ───────────────────────────────────
export const config = {
  matcher: [
    /*
     * Appliquer le middleware sur toutes les routes SAUF :
     * - Les fichiers statiques (_next/static, _next/image, favicon.ico)
     * - Les fichiers publics (images, icons, manifest, sw.js)
     * - Les routes API d'authentification (gérées par Auth.js)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|api/auth).*)",
  ],
};
