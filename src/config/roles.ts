// ─── Rôles utilisateurs ────────────────────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN:       "ADMIN",
  RH:          "RH",
  RESPONSABLE: "RESPONSABLE",
  EMPLOYE:     "EMPLOYE",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Labels affichés en français ───────────────────────────────────────────

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Administrateur",
  ADMIN:       "Administrateur",
  RH:          "Ressources Humaines",
  RESPONSABLE: "Responsable",
  EMPLOYE:     "Employé",
};

// ─── Hiérarchie des rôles (plus le nombre est élevé, plus le rôle est élevé)

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN:       4,
  RH:          3,
  RESPONSABLE: 2,
  EMPLOYE:     1,
};

// ─── Rôles ayant accès à l'espace administration ───────────────────────────

export const ADMIN_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.RH,
  ROLES.RESPONSABLE,
];

// ─── Rôles pouvant gérer le personnel ─────────────────────────────────────

export const PERSONNEL_MANAGER_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.RH,
];

// ─── Utilitaire : vérifier si un rôle a les droits admin ──────────────────

export function isAdminRole(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canManagePersonnel(role: Role): boolean {
  return PERSONNEL_MANAGER_ROLES.includes(role);
}

export function isSuperAdmin(role: Role): boolean {
  return role === ROLES.SUPER_ADMIN;
}
