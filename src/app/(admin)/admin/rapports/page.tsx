"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
}

export default function AdminRapportsPage() {
  const [tab, setTab] = useState<"quotidien" | "mensuel">("quotidien");
  
  // Filtres
  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  
  const [date, setDate] = useState(todayStr);
  const [mois, setMois] = useState(currentMonthStr);
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  // Données
  const [dataQuotidien, setDataQuotidien] = useState<any>(null);
  const [dataMensuel, setDataMensuel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger les départements
  useEffect(() => {
    fetch("/api/admin/departements")
      .then((r) => r.json())
      .then((d) => setDepartments(d.departements || []))
      .catch(() => {});
  }, []);

  // Charger le rapport quotidien
  const loadQuotidien = () => {
    setLoading(true);
    const params = new URLSearchParams({ date });
    if (departmentId) params.append("departmentId", departmentId);

    fetch(`/api/admin/rapports/quotidien?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setDataQuotidien(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Charger le rapport mensuel
  const loadMensuel = () => {
    setLoading(true);
    const params = new URLSearchParams({ mois });
    if (departmentId) params.append("departmentId", departmentId);

    fetch(`/api/admin/rapports/mensuel?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setDataMensuel(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === "quotidien") {
      loadQuotidien();
    } else {
      loadMensuel();
    }
  }, [tab, date, mois, departmentId]);

  const handleExport = () => {
    const params = new URLSearchParams({ type: tab });
    if (tab === "quotidien") {
      params.append("date", date);
    } else {
      params.append("mois", mois);
    }
    if (departmentId) params.append("departmentId", departmentId);

    window.open(`/api/admin/rapports/export?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Analyses des présences, assiduité et exportations
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
        >
          <span>📥</span> Exporter en Excel / CSV
        </button>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("quotidien")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition ${
            tab === "quotidien"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📅 Rapport Quotidien
        </button>
        <button
          onClick={() => setTab("mensuel")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition ${
            tab === "mensuel"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📊 Rapport Mensuel
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        {tab === "quotidien" ? (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Date du jour
            </label>
            <input
              type="date"
              className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Mois
            </label>
            <input
              type="month"
              className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={mois}
              onChange={(e) => setMois(e.target.value)}
            />
          </div>
        )}

        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Département
          </label>
          <select
            className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">Tous les départements</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu Quotidien */}
      {tab === "quotidien" && (
        <div className="space-y-6">
          {dataQuotidien?.synthese && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-xs text-gray-400 font-semibold uppercase">Taux de présence</span>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {dataQuotidien.synthese.tauxPresence}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dataQuotidien.synthese.presents + dataQuotidien.synthese.retards} / {dataQuotidien.synthese.totalEmployes} employés
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
                <span className="text-xs text-green-600 font-semibold uppercase">À l'heure</span>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  {dataQuotidien.synthese.presents}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm">
                <span className="text-xs text-orange-600 font-semibold uppercase">En retard</span>
                <p className="text-3xl font-bold text-orange-700 mt-1">
                  {dataQuotidien.synthese.retards}
                </p>
                <p className="text-xs text-orange-500 mt-1">
                  Total : {dataQuotidien.synthese.totalRetardMinutes} min
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm">
                <span className="text-xs text-red-600 font-semibold uppercase">Absents</span>
                <p className="text-3xl font-bold text-red-700 mt-1">
                  {dataQuotidien.synthese.absents}
                </p>
              </div>
            </div>
          )}

          {/* Tableau Quotidien */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-3">Employé</th>
                      <th className="text-left px-5 py-3">Département</th>
                      <th className="text-left px-5 py-3">Poste</th>
                      <th className="text-left px-5 py-3">Arrivée</th>
                      <th className="text-left px-5 py-3">Départ</th>
                      <th className="text-left px-5 py-3">Retard</th>
                      <th className="text-left px-5 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {dataQuotidien?.details?.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <span className="font-semibold text-gray-900 block">
                            {emp.prenom} {emp.nom}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {emp.matricule}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{emp.departement}</td>
                        <td className="px-5 py-3 text-gray-600">{emp.poste || "—"}</td>
                        <td className="px-5 py-3 font-mono text-gray-800">
                          {emp.checkIn ? formatTime(emp.checkIn) : "--:--"}
                        </td>
                        <td className="px-5 py-3 font-mono text-gray-500">
                          {emp.checkOut ? formatTime(emp.checkOut) : "--:--"}
                        </td>
                        <td className="px-5 py-3 font-medium">
                          {emp.lateMinutes > 0 ? (
                            <span className="text-orange-600">+{emp.lateMinutes} min</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              emp.statut === "PRESENT"
                                ? "bg-green-100 text-green-700"
                                : emp.statut === "RETARD"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {emp.statut === "PRESENT"
                              ? "Présent"
                              : emp.statut === "RETARD"
                              ? "Retard"
                              : "Absent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenu Mensuel */}
      {tab === "mensuel" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Employé</th>
                    <th className="text-left px-5 py-3">Département</th>
                    <th className="text-left px-5 py-3">Poste</th>
                    <th className="text-center px-5 py-3">Jours Présents</th>
                    <th className="text-center px-5 py-3">Jours Retard</th>
                    <th className="text-center px-5 py-3">Cumul Retard</th>
                    <th className="text-center px-5 py-3">Heures Travaillées</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataMensuel?.statistiques?.map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-gray-900 block">
                          {emp.prenom} {emp.nom}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {emp.matricule}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{emp.departement}</td>
                      <td className="px-5 py-3 text-gray-600">{emp.poste || "—"}</td>
                      <td className="px-5 py-3 text-center font-semibold text-green-700">
                        {emp.joursPresents} j
                      </td>
                      <td className="px-5 py-3 text-center font-medium text-orange-600">
                        {emp.joursRetard} j
                      </td>
                      <td className="px-5 py-3 text-center font-mono">
                        {emp.totalMinutesRetard > 0 ? (
                          <span className="text-orange-600 font-semibold">{emp.totalMinutesRetard} min</span>
                        ) : (
                          <span className="text-gray-400">0 min</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center font-semibold text-primary-700">
                        {emp.totalHeuresTravaillées} h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
