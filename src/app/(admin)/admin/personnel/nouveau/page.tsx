"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function NouvelEmployePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    matricule: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    poste: "",
    role: "EMPLOYE",
    departmentId: "",
    password: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/departements")
      .then((res) => res.json())
      .then((data) => {
        if (data.departements) {
          setDepartments(data.departements);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      router.push("/admin/personnel");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter un employé</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Créer un nouvel accès employé pour le pointage
          </p>
        </div>
        <Link
          href="/admin/personnel"
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Retour à la liste
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matricule *
              </label>
              <input
                type="text"
                name="matricule"
                required
                placeholder="Ex: ICN002"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none uppercase font-mono"
                value={formData.matricule}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                name="role"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="EMPLOYE">Employé</option>
                <option value="ADMIN">Administrateur</option>
                <option value="SUPERVISEUR">Superviseur</option>
                <option value="RH">Ressources Humaines</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                required
                placeholder="Prénom"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.prenom}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                required
                placeholder="Nom de famille"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.nom}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@iconegroupe.sn"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                placeholder="+221 ..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <select
                name="departmentId"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                value={formData.departmentId}
                onChange={handleChange}
              >
                <option value="">Sélectionner un département</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poste
              </label>
              <input
                type="text"
                name="poste"
                placeholder="Ex: Développeur, Formateur, etc."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.poste}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe initial *
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Minimum 6 caractères"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.password}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-400 mt-1">
              L'employé pourra modifier son mot de passe depuis son profil.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/admin/personnel"
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Création en cours..." : "Créer l'employé"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
