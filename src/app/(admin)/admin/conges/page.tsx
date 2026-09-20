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
  user: {
    prenom: string;
    nom: string;
    matricule: string;
    department: {
      name: string;
    };
  };
}

const statusBadge: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-orange-100 text-orange-700 border-orange-200" },
  APPROUVE: { label: "Approuvé", color: "bg-green-100 text-green-700 border-green-200" },
  REFUSE: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function AdminCongesPage() {
  const [demandes, setDemandes] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TOUS");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadDemandes = () => {
    setLoading(true);
    fetch(`/api/admin/conges?status=${filter}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.demandes) setDemandes(data.demandes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDemandes();
  }, [filter]);

  const handleAction = async (id: string, actionStatus: string) => {
    if (!confirm(`Voulez-vous vraiment marquer cette demande comme ${actionStatus} ?`)) return;

    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/conges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: actionStatus }),
      });

      if (res.ok) {
        loadDemandes(); // Rafraichir la liste
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (err) {
      alert("Erreur serveur inattendue.");
    } finally {
      setUpdating(null);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de Congés & Absences</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gérez les demandes soumises par les employés.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="TOUS">Toutes les demandes</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="APPROUVE">Approuvées</option>
          <option value="REFUSE">Refusées</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : demandes.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <span className="text-4xl">🏖️</span>
            <p className="mt-2 font-medium">Aucune demande trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employé</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Période</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motif</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {demandes.map((demande) => {
                  const badge = statusBadge[demande.status] || { label: demande.status, color: "bg-gray-100" };
                  return (
                    <tr key={demande.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{demande.user.prenom} {demande.user.nom}</div>
                        <div className="text-xs text-gray-500">{demande.user.department?.name} • {demande.user.matricule}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-gray-700 capitalize">{demande.type.toLowerCase()}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        Du <strong>{formatDate(demande.startDate)}</strong><br />
                        Au <strong>{formatDate(demande.endDate)}</strong>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={demande.reason || ""}>
                          {demande.reason || <span className="text-gray-400 italic">Aucun motif</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {demande.status === "EN_ATTENTE" && (
                          <>
                            <button
                              onClick={() => handleAction(demande.id, "APPROUVE")}
                              disabled={updating === demande.id}
                              className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-lg text-sm font-medium transition"
                            >
                              ✓ Approuver
                            </button>
                            <button
                              onClick={() => handleAction(demande.id, "REFUSE")}
                              disabled={updating === demande.id}
                              className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-lg text-sm font-medium transition"
                            >
                              ✕ Refuser
                            </button>
                          </>
                        )}
                        {demande.status !== "EN_ATTENTE" && (
                          <span className="text-xs text-gray-400 italic">Traité</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
