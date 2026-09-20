"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Employe {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  poste: string | null;
  status: string;
  role: string;
  department: { name: string } | null;
}

const statusColor: Record<string, string> = {
  ACTIF:   "bg-green-100 text-green-700",
  INACTIF: "bg-red-100 text-red-700",
  SUSPENDU:"bg-orange-100 text-orange-700",
};

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("TOUS");

  useEffect(() => {
    fetch("/api/admin/personnel")
      .then(r => r.json())
      .then(data => { setPersonnel(data.personnel || []); setLoading(false); });
  }, []);

  const handleDesactiver = async (id: string, nom: string) => {
    if (!confirm(`Désactiver l'employé ${nom} ?`)) return;
    await fetch(`/api/admin/personnel/${id}`, { method: "DELETE" });
    setPersonnel(prev => prev.map(e => e.id === id ? { ...e, status: "INACTIF" } : e));
  };

  const filtered = personnel.filter(e => {
    const matchSearch = `${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "TOUS" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Personnel</h1>
          <p className="text-gray-500 text-sm">{personnel.filter(e => e.status === "ACTIF").length} employés actifs</p>
        </div>
        <Link
          href="/admin/personnel/nouveau"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-sm"
        >
          <span>+</span> Nouvel employé
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher par nom ou matricule..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
          <option value="SUSPENDU">Suspendu</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">👤</p>
            <p>Aucun employé trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Employé</th>
                  <th className="text-left px-5 py-3">Matricule</th>
                  <th className="text-left px-5 py-3">Département</th>
                  <th className="text-left px-5 py-3">Poste</th>
                  <th className="text-left px-5 py-3">Statut</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                          {e.prenom[0]}{e.nom[0]}
                        </div>
                        <span className="font-medium text-gray-900">{e.prenom} {e.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-600">{e.matricule}</td>
                    <td className="px-5 py-3 text-gray-600">{e.department?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600">{e.poste ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[e.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/personnel/${e.id}/modifier`}
                          className="text-xs text-primary-600 hover:underline font-medium"
                        >
                          Modifier
                        </Link>
                        {e.status === "ACTIF" && (
                          <button
                            onClick={() => handleDesactiver(e.id, `${e.prenom} ${e.nom}`)}
                            className="text-xs text-red-500 hover:underline font-medium"
                          >
                            Désactiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
