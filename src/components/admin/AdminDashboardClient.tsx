"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/admin/StatCard";
import { formatTime } from "@/lib/utils";

interface Stats {
  totalEmployes: number;
  presents: number;
  retards: number;
  absents: number;
  partis: number;
}

interface Pointage {
  id: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  lateMinutes: number;
  user: { prenom: string; nom: string; matricule: string; department: { name: string } | null };
  site: { name: string };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "Présent", color: "bg-green-100 text-green-700" },
  RETARD:  { label: "Retard",  color: "bg-orange-100 text-orange-700" },
  ABSENT:  { label: "Absent",  color: "bg-red-100 text-red-700" },
  MISSION: { label: "Mission", color: "bg-blue-100 text-blue-700" },
};

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      setStats(data.stats);
      setPointages(data.pointages);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Rafraîchissement automatique toutes les 60 secondes
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <p className="text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition"
        >
          <span>🔄</span>
          <span>Actualiser</span>
          <span className="text-gray-400 text-xs ml-1">
            ({lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })})
          </span>
        </button>
      </div>

      {/* Cartes de statistiques */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label="Effectif total"  value={stats.totalEmployes} icon="👥" color="blue"   />
          <StatCard label="Présents"        value={stats.presents}      icon="✅" color="green"  />
          <StatCard label="Retards"         value={stats.retards}       icon="⏰" color="orange" />
          <StatCard label="Absents"         value={stats.absents}       icon="❌" color="red"    />
          <StatCard label="Partis"          value={stats.partis}        icon="🚪" color="purple" />
        </div>
      )}

      {/* Tableau des pointages du jour */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Pointages du jour</h2>
          <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {pointages.length} enregistrement{pointages.length > 1 ? "s" : ""}
          </span>
        </div>

        {pointages.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">Aucun pointage enregistré pour aujourd'hui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Employé</th>
                  <th className="text-left px-5 py-3">Département</th>
                  <th className="text-left px-5 py-3">Arrivée</th>
                  <th className="text-left px-5 py-3">Départ</th>
                  <th className="text-left px-5 py-3">Retard</th>
                  <th className="text-left px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pointages.map((p) => {
                  const sc = statusConfig[p.status] ?? { label: p.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{p.user.prenom} {p.user.nom}</p>
                        <p className="text-gray-400 text-xs">{p.user.matricule}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {p.user.department?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-800">
                        {formatTime(p.checkIn)}
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-500">
                        {p.checkOut ? formatTime(p.checkOut) : <span className="italic text-gray-300">En cours</span>}
                      </td>
                      <td className="px-5 py-3 text-orange-600 font-medium">
                        {p.lateMinutes > 0 ? `+${p.lateMinutes} min` : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                          {sc.label}
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
