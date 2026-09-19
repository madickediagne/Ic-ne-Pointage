// ─── Classes d'erreurs personnalisées ─────────────────────────────────────

/**
 * Erreur de base de l'application.
 * Toutes les erreurs métier héritent de cette classe.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ─── Erreurs d'authentification ────────────────────────────────────────────

export class AuthError extends AppError {
  constructor(message = "Non autorisé", code = "UNAUTHORIZED") {
    super(message, code, 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Accès refusé", code = "FORBIDDEN") {
    super(message, code, 403);
    this.name = "ForbiddenError";
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("Matricule ou mot de passe incorrect.", "INVALID_CREDENTIALS", 401);
    this.name = "InvalidCredentialsError";
  }
}

export class AccountInactiveError extends AppError {
  constructor() {
    super("Votre compte est désactivé. Contactez l'administration.", "ACCOUNT_INACTIVE", 403);
    this.name = "AccountInactiveError";
  }
}

// ─── Erreurs de pointage ───────────────────────────────────────────────────

export class PointageError extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 422);
    this.name = "PointageError";
  }
}

export class AlreadyCheckedInError extends PointageError {
  constructor() {
    super("Votre arrivée a déjà été enregistrée aujourd'hui.", "ALREADY_CHECKED_IN");
    this.name = "AlreadyCheckedInError";
  }
}

export class AlreadyCheckedOutError extends PointageError {
  constructor() {
    super("Votre départ a déjà été enregistré aujourd'hui.", "ALREADY_CHECKED_OUT");
    this.name = "AlreadyCheckedOutError";
  }
}

export class NoCheckInError extends PointageError {
  constructor() {
    super("Aucune arrivée enregistrée. Pointez d'abord votre arrivée.", "NO_CHECK_IN");
    this.name = "NoCheckInError";
  }
}

// ─── Erreurs GPS ───────────────────────────────────────────────────────────

export class GpsError extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 422);
    this.name = "GpsError";
  }
}

export class OutsideZoneError extends GpsError {
  constructor(distance: number, radius: number) {
    super(
      `Vous êtes en dehors de la zone autorisée (${Math.round(distance)} m, rayon : ${radius} m).`,
      "OUTSIDE_ZONE"
    );
    this.name = "OutsideZoneError";
  }
}

export class GpsInaccurateError extends GpsError {
  constructor(accuracy: number) {
    super(
      `Votre position GPS n'est pas suffisamment précise (${Math.round(accuracy)} m). Veuillez réessayer en extérieur.`,
      "GPS_INACCURATE"
    );
    this.name = "GpsInaccurateError";
  }
}

// ─── Erreurs QR Code ───────────────────────────────────────────────────────

export class QrError extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 422);
    this.name = "QrError";
  }
}

export class InvalidQrError extends QrError {
  constructor() {
    super("Ce QR Code n'est pas reconnu.", "QR_INVALID");
    this.name = "InvalidQrError";
  }
}

export class InactiveQrError extends QrError {
  constructor() {
    super("Ce QR Code est désactivé. Contactez l'administration.", "QR_INACTIVE");
    this.name = "InactiveQrError";
  }
}

// ─── Erreurs de ressource ─────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(resource = "Ressource") {
    super(`${resource} introuvable.`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super("Données invalides.", "VALIDATION_ERROR", 422);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

// ─── Utilitaire : formater une erreur pour la réponse API ─────────────────

export function formatErrorResponse(error: unknown): {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
} {
  if (error instanceof ValidationError) {
    return { message: error.message, code: error.code, errors: error.errors };
  }
  if (error instanceof AppError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof Error) {
    return { message: error.message, code: "INTERNAL_ERROR" };
  }
  return { message: "Une erreur inattendue s'est produite.", code: "INTERNAL_ERROR" };
}
