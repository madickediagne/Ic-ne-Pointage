// ─── Constantes globales du système ───────────────────────────────────────

// ── Géolocalisation ────────────────────────────────────────────────────────

/** Rayon GPS par défaut autorisé autour du site (en mètres) */
export const DEFAULT_GPS_RADIUS = Number(process.env.NEXT_PUBLIC_DEFAULT_RADIUS) || 50;

/** Précision GPS maximale acceptée (en mètres). Au-delà, on demande de réessayer */
export const MAX_GPS_ACCURACY = Number(process.env.NEXT_PUBLIC_MAX_GPS_ACCURACY) || 100;

/** Timeout pour l'obtention de la position GPS (en millisecondes) */
export const GPS_TIMEOUT_MS = 15_000;

/** Âge maximum d'une position GPS en cache (en millisecondes) */
export const GPS_MAX_AGE_MS = 10_000;

// ── Horaires ───────────────────────────────────────────────────────────────

/** Tolérance de retard par défaut (en minutes) */
export const DEFAULT_RETARD_TOLERANCE = 15;

/** Heure de début de travail par défaut */
export const DEFAULT_START_TIME = "08:00";

/** Heure de fin de travail par défaut */
export const DEFAULT_END_TIME = "17:00";

/** Jours ouvrés par défaut (0=Dimanche, 1=Lundi ... 6=Samedi) */
export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]; // Lundi → Vendredi

// ── Authentification & Sécurité ────────────────────────────────────────────

/** Nombre maximum de tentatives de connexion avant blocage temporaire */
export const MAX_LOGIN_ATTEMPTS = 5;

/** Durée du blocage après trop de tentatives (en minutes) */
export const LOGIN_LOCKOUT_MINUTES = 15;

/** Format du matricule (ex: ICN001) */
export const MATRICULE_REGEX = /^[A-Z]{2,5}\d{3,6}$/;

/** Préfixe des matricules Icône Groupe */
export const MATRICULE_PREFIX = "ICN";

// ── QR Code ────────────────────────────────────────────────────────────────

/** Taille du QR Code généré en pixels */
export const QR_SIZE = 400;

/** Marge du QR Code */
export const QR_MARGIN = 2;

// ── Pagination ─────────────────────────────────────────────────────────────

/** Nombre d'éléments par page par défaut */
export const DEFAULT_PAGE_SIZE = 20;

/** Tailles de page disponibles */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ── Messages d'erreur utilisateur ─────────────────────────────────────────

export const ERROR_MESSAGES = {
  GPS_DISABLED:        "Veuillez activer la localisation pour effectuer votre pointage.",
  GPS_INACCURATE:      "Votre position GPS n'est pas suffisamment précise. Veuillez réessayer en extérieur.",
  GPS_TIMEOUT:         "Impossible d'obtenir votre position. Vérifiez que la localisation est activée.",
  OUTSIDE_ZONE:        "Vous êtes actuellement en dehors de la zone autorisée.",
  QR_INVALID:          "Ce QR Code n'est pas reconnu.",
  QR_INACTIVE:         "Ce QR Code est désactivé. Contactez l'administration.",
  ALREADY_CHECKED_IN:  "Votre arrivée a déjà été enregistrée aujourd'hui.",
  ALREADY_CHECKED_OUT: "Votre départ a déjà été enregistré aujourd'hui.",
  NO_CHECK_IN:         "Aucune arrivée enregistrée. Pointez d'abord votre arrivée.",
  DAY_COMPLETE:        "Votre journée est déjà complète (arrivée et départ enregistrés).",
  ACCOUNT_INACTIVE:    "Votre compte est désactivé. Contactez l'administration.",
  DEVICE_UNKNOWN:      "Cet appareil n'est pas reconnu pour votre compte. Contactez l'administration.",
  NO_INTERNET:         "Une connexion Internet est nécessaire pour effectuer le pointage.",
  SERVER_ERROR:        "Une erreur s'est produite. Veuillez réessayer.",
  UNAUTHORIZED:        "Vous n'êtes pas autorisé à effectuer cette action.",
  SESSION_EXPIRED:     "Votre session a expiré. Veuillez vous reconnecter.",
  INVALID_CREDENTIALS: "Matricule ou mot de passe incorrect.",
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];

// ── Messages de succès ─────────────────────────────────────────────────────

export const SUCCESS_MESSAGES = {
  CHECKED_IN:   "Arrivée enregistrée avec succès.",
  CHECKED_OUT:  "Départ enregistré avec succès.",
  PROFILE_UPDATED: "Profil mis à jour.",
  USER_CREATED: "Employé créé avec succès.",
  USER_UPDATED: "Employé modifié avec succès.",
  QR_GENERATED: "QR Code généré avec succès.",
} as const;

// ── Actions d'audit ────────────────────────────────────────────────────────

export const AUDIT_ACTIONS = {
  LOGIN:              "LOGIN",
  LOGOUT:             "LOGOUT",
  LOGIN_FAILED:       "LOGIN_FAILED",
  CHECK_IN:           "CHECK_IN",
  CHECK_OUT:          "CHECK_OUT",
  CHECK_IN_REFUSED:   "CHECK_IN_REFUSED",
  CHECK_OUT_REFUSED:  "CHECK_OUT_REFUSED",
  QR_GENERATED:       "QR_GENERATED",
  QR_REGENERATED:     "QR_REGENERATED",
  USER_CREATED:       "USER_CREATED",
  USER_UPDATED:       "USER_UPDATED",
  USER_DEACTIVATED:   "USER_DEACTIVATED",
  USER_REACTIVATED:   "USER_REACTIVATED",
  SITE_UPDATED:       "SITE_UPDATED",
  LEAVE_CREATED:      "LEAVE_CREATED",
  LEAVE_APPROVED:     "LEAVE_APPROVED",
  LEAVE_REFUSED:      "LEAVE_REFUSED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
