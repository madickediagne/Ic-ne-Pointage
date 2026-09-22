"use client";

import { useEffect, useState } from "react";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  createdAt: string;
}

// Types bien séparés
const LEAVE_TYPES = [
  {
    value: "CONGE",
    label: "Congé annuel",
    icon: "🏖️",
    description: "Jours de congé payés",
    category: "absence",
  },
  {
    value: "ABSENCE",
    label: "Absence justifiée",
    icon: "📋",
    description: "Absence pour raison personnelle ou familiale",
    category: "absence",
  },
  {
    value: "MALADIE",
    label: "Arrêt maladie",
    icon: "🏥",
    description: "Absence pour raison médicale",
    category: "absence",
  },
  {
    value: "MISSION",
    label: "Mission professionnelle",
    icon: "✈️",
    description: "Déplacement ou travail en dehors du site",
    category: "absence",
  },
  {
    value: "PERMISSION_ABSENCE",
    label: "Permission d'absence (journée)",
    icon: "📅",
    description: "Autorisation pour s'absenter une journée ou plusieurs jours",
    category: "permission",
  },
  {
    value: "PERMISSION_DEPART",
    label: "Permission de départ anticipé",
    icon: "🚪",
    description: "Je suis venu au travail mais j'ai besoin de partir avant l'heure normale",
    category: "permission",
  },
];

const statusBadge: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-orange-100 text-orange-700" },
  APPROUVE: { label: "Approuvé", color: "bg-green-100 text-green-700" },
  REFUSE: { label: "Refusé", color: "bg-red-100 text-red-700" },
};

export default function CongesEmployePage() {
  const [demandes, setDemandes] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "CONGE",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const selectedType = LEAVE_TYPES.find((t) => t.value === formData.type);
  // Pour "PERMISSION_DEPART", la date de fin = date de début automatiquement
  const isDepartAnticipe = formData.type === "PERMISSION_DEPART";

  const loadDemandes = () => {
    setLoading(true);
    fetch("/api/employe/conges")
      .then((r) => r.json())
      .then((data) => {
        if (data.demandes) setDemandes(data.demandes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDemandes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...formData,
      endDate: isDepartAnticipe ? formData.startDate : formData.endDate,
    };

    try {
      const res = await fetch("/api/employe/conges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de création.");

      setShowForm(false);
      setFormData({ type: "CONGE", startDate: "", endDate: "", reason: "" });
      loadDemandes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

  const getTypeInfo = (typeValue: string) =>
    LEAVE_TYPES.find((t) => t.value === typeValue) || {
      label: typeValue, icon: "📄", category: "absence",
    };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Absences & Permissions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Congés, absences et demandes de départ anticipé</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md transition"
          >
            +
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Nouvelle demande</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-sm">
              Fermer
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sélection du type (visuellement divisé en 2 catégories) */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Absences & Congés</p>
              <div className="grid grid-cols-1 gap-2 mb-3">
                {LEAVE_TYPES.filter((t) => t.category === "absence").map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      formData.type === t.value
                        ? "border-primary-400 bg-primary-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.value}
                      checked={formData.type === t.value}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-0.5 accent-primary-600"
                    />
                    <div>
                      <span className="font-semibold text-sm text-gray-800">{t.icon} {t.label}</span>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Permissions</p>
                <div className="grid grid-cols-1 gap-2">
                  {LEAVE_TYPES.filter((t) => t.category === "permission").map((t) => (
                    <label
                      key={t.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        formData.type === t.value
                          ? "border-primary-400 bg-primary-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t.value}
                        checked={formData.type === t.value}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-0.5 accent-primary-600"
                      />
                      <div>
                        <span className="font-semibold text-sm text-gray-800">{t.icon} {t.label}</span>
                        <p className="text-xs text-gray-500">{t.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              {isDepartAnticipe ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    📅 Date concernée
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  <p className="text-xs text-amber-600 mt-1.5">
                    ⚠️ Cette permission concerne uniquement ce jour. La date de fin est automatiquement la même.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📅 Du</label>
                    <input
                      type="date"
                      required
                      min={today}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📅 Au</label>
                    <input
                      type="date"
                      required
                      min={formData.startDate || today}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Motif */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Motif (optionnel)</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                rows={3}
                placeholder="Précisez la raison de votre demande..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-50"
            >
              {saving ? "Envoi en cours..." : "Soumettre la demande"}
            </button>
          </form>
        </div>
      )}

      {/* Liste des demandes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : demandes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm text-gray-400">
          <span className="text-4xl">📋</span>
          <p className="mt-2 font-medium">Aucune demande pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandes.map((item) => {
            const badge = statusBadge[item.status] || { label: item.status, color: "bg-gray-100 text-gray-700" };
            const typeInfo = getTypeInfo(item.type);
            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{formatDate(item.createdAt)}</span>
                </div>

                <div className="text-sm text-gray-600 font-medium mb-2">
                  {item.startDate === item.endDate ? (
                    <>Le <span className="text-gray-900">{formatDate(item.startDate)}</span></>
                  ) : (
                    <>Du <span className="text-gray-900">{formatDate(item.startDate)}</span> au <span className="text-gray-900">{formatDate(item.endDate)}</span></>
                  )}
                </div>

                {item.reason && (
                  <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg italic">"{item.reason}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
