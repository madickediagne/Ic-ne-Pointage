"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";

interface PointageItem {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  lateMinutes: number;
  user: {
    prenom: string;
    nom: string;
    matricule: string;
    department: { name: string } | null;
  };
  site: { name: string };
}

const statusBadge: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "Présent", color: "bg-green-100 text-green-700" },
  RETARD: { label: "Retard", color: "bg-orange-100 text-orange-700" },
  ABSENT: { label: "Absent", color: "bg-red-100 text-red-700" },
  MISSION: { label: "Mission", color: "bg-blue-100 text-blue-700" },
};

export default function AdminPointagesPage() {
  const [pointages, setPointages] = useState<PointageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");

  const loadPointages = () => {
    setLoading(true);
    const query = filterDate ? `?date=${filterDate}` : "";
    fetch(`/api/admin/pointages${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pointages) setPointages(data.pointages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPointages();
  }, [filterDate]);

  const filtered = pointages.filter((p) => {
    const term = `${p.user.prenom} ${p.user.nom} ${p.user.matricule}`.toLowerCase();
    return term.includes(search.toLowerCase());
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal des Pointages</h1>
          <p className="text-gray-500 text-sm">
            Historique complet des arrivées et départs
          </p>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher un employé ou matricule..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p>Aucun pointage trouvé pour ces critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Employé</th>
                  <th className="text-left px-5 py-3">Département</th>
                  <th className="text-left px-5 py-3">Arrivée</th>
                  <th className="text-left px-5 py-3">Départ</th>
                  <th className="text-left px-5 py-3">Retard</th>
                  <th className="text-left px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => {
                  const badge = statusBadge[item.status] || {
                    label: item.status,
                    color: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium text-gray-700">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-gray-900 block">
                          {item.user.prenom} {item.user.nom}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {item.user.matricule}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {item.user.department?.name || "—"}
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-800">
                        {formatTime(item.checkIn)}
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-500">
                        {item.checkOut ? formatTime(item.checkOut) : "—"}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {item.lateMinutes > 0 ? (
                          <span className="text-orange-600">+{item.lateMinutes} min</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                        >
                          {badge.label}
                        </span>
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
