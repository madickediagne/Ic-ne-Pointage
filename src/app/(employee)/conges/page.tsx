"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  createdAt: string;
}

const statusBadge: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-orange-100 text-orange-700" },
  APPROUVE: { label: "Approuvé", color: "bg-green-100 text-green-700" },
  REFUSE: { label: "Refusé", color: "bg-red-100 text-red-700" },
};

export default function CongesEmployePage() {
  const router = useRouter();
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

    try {
      const res = await fetch("/api/employe/conges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Absences</h1>
          <p className="text-gray-500 text-sm mt-0.5">Demandes de congés et permissions</p>
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

      {showForm && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Nouvelle demande</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-sm font-medium">
              Fermer
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
              <select
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="CONGE">Congé annuel</option>
                <option value="PERMISSION">Permission / Absence</option>
                <option value="MISSION">Mission professionnelle</option>
                <option value="MALADIE">Maladie</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Du</label>
                <input
                  type="date"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Au</label>
                <input
                  type="date"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Motif (Optionnel)</label>
              <textarea
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                rows={3}
                placeholder="Précisez la raison..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition shadow-sm disabled:opacity-50"
            >
              {saving ? "Envoi en cours..." : "Soumettre la demande"}
            </button>
          </form>
        </div>
      )}

      {/* Liste des demandes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : demandes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm text-gray-400">
          <span className="text-4xl">🏖️</span>
          <p className="mt-2 font-medium">Aucune demande pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandes.map((item) => {
            const badge = statusBadge[item.status] || { label: item.status, color: "bg-gray-100 text-gray-700" };
            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 capitalize">{item.type.toLowerCase()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 font-medium mb-2">
                  Du <span className="text-gray-900">{formatDate(item.startDate)}</span> au <span className="text-gray-900">{formatDate(item.endDate)}</span>
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
