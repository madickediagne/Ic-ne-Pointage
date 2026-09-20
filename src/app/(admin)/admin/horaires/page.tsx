"use client";

import { useEffect, useState } from "react";

interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  tolerance: number;
  workingDays: number[];
  department: {
    id: string;
    name: string;
    status: string;
  };
}

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function HorairesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    startTime: "",
    endTime: "",
    tolerance: 15,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/horaires")
      .then((r) => r.json())
      .then((data) => {
        setSchedules(data.schedules || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEdit = (s: Schedule) => {
    setEditId(s.id);
    setEditForm({
      startTime: s.startTime,
      endTime: s.endTime,
      tolerance: s.tolerance,
    });
    setSuccess(null);
    setError(null);
  };

  const handleCancel = () => {
    setEditId(null);
    setError(null);
  };

  const handleSave = async (id: string, deptName: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/horaires/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour.");
        setSaving(false);
        return;
      }

      // Mise à jour locale
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                startTime: editForm.startTime,
                endTime: editForm.endTime,
                tolerance: editForm.tolerance,
              }
            : s
        )
      );
      setEditId(null);
      setSuccess(`Horaire de "${deptName}" mis à jour avec succès.`);
    } catch {
      setError("Erreur serveur inattendue.");
    } finally {
      setSaving(false);
    }
  };

  const activeDepts = schedules.filter((s) => s.department.status === "ACTIF");
  const inactiveDepts = schedules.filter((s) => s.department.status !== "ACTIF");

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Horaires</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Configurez les heures d'arrivée, de départ et la tolérance pour chaque département.
          Les Directeurs, Chefs et Administrateurs ne sont pas soumis au calcul de retard.
        </p>
      </div>

      {/* Alerte succès */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
          <span>✅</span> {success}
        </div>
      )}

      {/* Info règle d'exemption */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm flex items-start gap-2">
        <span className="text-lg">ℹ️</span>
        <div>
          <strong>Règle d'exemption active :</strong> Les employés dont le poste contient
          <em> "Directeur"</em>, <em>"Chef"</em> ou <em>"Responsable"</em>, ainsi que les
          comptes Administrateurs et Superviseurs, ne sont <strong>jamais</strong> marqués
          "en retard" dans le système.
        </div>
      </div>

      {/* Tableau des horaires */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">
            Départements Actifs Icône Groupe
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeDepts.map((s) => (
              <div
                key={s.id}
                className="px-5 py-4 hover:bg-gray-50 transition"
              >
                {editId === s.id ? (
                  // Mode édition
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900">
                        {s.department.name}
                      </h3>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        {error}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                          Heure d'arrivée
                        </label>
                        <input
                          type="time"
                          className="w-full px-3.5 py-2.5 border border-primary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                          value={editForm.startTime}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              startTime: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                          Heure de départ
                        </label>
                        <input
                          type="time"
                          className="w-full px-3.5 py-2.5 border border-primary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                          value={editForm.endTime}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              endTime: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                          Tolérance (minutes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          className="w-full px-3.5 py-2.5 border border-primary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          value={editForm.tolerance}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              tolerance: Number(e.target.value),
                            }))
                          }
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Ex: 15 → pointage valide jusqu'à{" "}
                          {editForm.startTime}+{editForm.tolerance}min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSave(s.id, s.department.name)}
                        disabled={saving}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
                      >
                        {saving ? "Enregistrement..." : "✓ Enregistrer"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {s.department.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-sm text-gray-600 font-mono">
                            🕗 {s.startTime} → {s.endTime}
                          </span>
                          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                            Tolérance : {s.tolerance} min
                          </span>
                          <span className="text-xs text-gray-400">
                            Jours:{" "}
                            {s.workingDays.map((d) => DAYS[d]).join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEdit(s)}
                      className="flex-shrink-0 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 border border-primary-100 rounded-xl font-medium transition"
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                )}
              </div>
            ))}

            {activeDepts.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <p className="text-3xl mb-2">⏰</p>
                <p>Aucun horaire configuré. Contactez l'administrateur.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
