import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Tailwind CSS ──────────────────────────────────────────────────────────

/**
 * Fusionne des classes Tailwind CSS de manière intelligente.
 * Évite les conflits de classes (ex: bg-red et bg-blue → garde bg-blue).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Dates & Heures ────────────────────────────────────────────────────────

/**
 * Formate une date en français.
 * Ex: "19 septembre 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: fr });
}

/**
 * Formate une date courte.
 * Ex: "19/09/2026"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy");
}

/**
 * Formate une heure.
 * Ex: "07h58"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH'h'mm");
}

/**
 * Formate une date et heure complètes.
 * Ex: "19/09/2026 à 07h58"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy 'à' HH'h'mm", { locale: fr });
}

/**
 * Retourne un libellé relatif pour une date.
 * Ex: "Aujourd'hui", "Hier", "il y a 2 jours"
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Aujourd'hui";
  if (isYesterday(d)) return "Hier";
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

/**
 * Retourne la date du jour au format ISO (YYYY-MM-DD).
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Retards ───────────────────────────────────────────────────────────────

/**
 * Formate un nombre de minutes de retard.
 * Ex: 5 → "5 min de retard"
 *      75 → "1h15 de retard"
 */
export function formatRetard(minutes: number): string {
  if (minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min de retard`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")} de retard` : `${h}h de retard`;
}

// ─── Matricule ─────────────────────────────────────────────────────────────

/**
 * Formate un matricule en majuscules.
 * Ex: "icn001" → "ICN001"
 */
export function formatMatricule(matricule: string): string {
  return matricule.toUpperCase().trim();
}

// ─── Texte ─────────────────────────────────────────────────────────────────

/**
 * Retourne les initiales d'un nom complet.
 * Ex: "Madicke Diagne" → "MD"
 */
export function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

/**
 * Tronque un texte à une longueur maximale.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// ─── Nombres ───────────────────────────────────────────────────────────────

/**
 * Formate un nombre avec séparateur de milliers.
 * Ex: 1500 → "1 500"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-SN").format(n);
}

/**
 * Calcule un pourcentage.
 * Ex: (31, 42) → "73.8%"
 */
export function calcPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

// ─── URL & Params ──────────────────────────────────────────────────────────

/**
 * Construit une URL avec des paramètres de requête.
 */
export function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(path, "http://localhost");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });
  return `${url.pathname}${url.search}`;
}
