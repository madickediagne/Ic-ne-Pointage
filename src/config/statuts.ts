// ─── Statuts de présence ───────────────────────────────────────────────────

export const STATUTS = {
  PRESENT:             "PRESENT",
  RETARD:              "RETARD",
  ABSENT:              "ABSENT",
  MISSION:             "MISSION",
  PERMISSION:          "PERMISSION",
  CONGE:               "CONGE",
  TELETRAVAIL:         "TELETRAVAIL",
  ABSENCE_JUSTIFIEE:   "ABSENCE_JUSTIFIEE",
  ABSENCE_NON_JUSTIFIEE: "ABSENCE_NON_JUSTIFIEE",
} as const;

export type Statut = (typeof STATUTS)[keyof typeof STATUTS];

// ─── Labels en français ────────────────────────────────────────────────────

export const STATUT_LABELS: Record<Statut, string> = {
  PRESENT:               "Présent",
  RETARD:                "Retard",
  ABSENT:                "Absent",
  MISSION:               "Mission",
  PERMISSION:            "Permission",
  CONGE:                 "Congé",
  TELETRAVAIL:           "Télétravail",
  ABSENCE_JUSTIFIEE:     "Absence justifiée",
  ABSENCE_NON_JUSTIFIEE: "Absence non justifiée",
};

// ─── Couleurs Tailwind CSS par statut ─────────────────────────────────────

export const STATUT_COLORS: Record<Statut, { bg: string; text: string; border: string; dot: string }> = {
  PRESENT: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  RETARD: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  ABSENT: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  MISSION: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  PERMISSION: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  CONGE: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  TELETRAVAIL: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
  },
  ABSENCE_JUSTIFIEE: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  ABSENCE_NON_JUSTIFIEE: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    dot: "bg-red-600",
  },
};

// ─── Statuts qui comptent comme "présent au travail" ──────────────────────

export const STATUTS_PRESENTS: Statut[] = [
  STATUTS.PRESENT,
  STATUTS.RETARD,
  STATUTS.TELETRAVAIL,
];

// ─── Statuts qui nécessitent une justification admin ──────────────────────

export const STATUTS_JUSTIFIABLES: Statut[] = [
  STATUTS.MISSION,
  STATUTS.PERMISSION,
  STATUTS.CONGE,
  STATUTS.ABSENCE_JUSTIFIEE,
];

// ─── Types de congés / demandes ───────────────────────────────────────────

export const LEAVE_TYPES = {
  CONGE:      "CONGE",
  PERMISSION: "PERMISSION",
  MISSION:    "MISSION",
} as const;

export type LeaveType = (typeof LEAVE_TYPES)[keyof typeof LEAVE_TYPES];

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  CONGE:      "Congé",
  PERMISSION: "Permission",
  MISSION:    "Mission",
};

// ─── Statuts des demandes de congé ────────────────────────────────────────

export const LEAVE_STATUS = {
  EN_ATTENTE: "EN_ATTENTE",
  APPROUVE:   "APPROUVE",
  REFUSE:     "REFUSE",
} as const;

export type LeaveStatus = (typeof LEAVE_STATUS)[keyof typeof LEAVE_STATUS];

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  EN_ATTENTE: "En attente",
  APPROUVE:   "Approuvé",
  REFUSE:     "Refusé",
};
