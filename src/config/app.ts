// ─── Configuration globale de l'application ────────────────────────────────

export const APP_CONFIG = {
  name: "Icône Pointage",
  shortName: "Icône",
  description: "Application de gestion du pointage du personnel — Icône Groupe Thiès",
  version: "1.0.0",
  organization: "Icône Groupe",

  // URL de l'application
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  // Contact
  supportEmail: "admin@icone-groupe.sn",

  // Localisation
  locale: "fr-SN",
  timezone: "Africa/Dakar",
  currency: "XOF",

  // Pagination par défaut
  defaultPageSize: 20,

  // Durée des sessions (en secondes) — 8 heures
  sessionMaxAge: 8 * 60 * 60,
} as const;

export type AppConfig = typeof APP_CONFIG;
