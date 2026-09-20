"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Department {
  id: string;
  name: string;
}

export default function ModifierEmployePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    matricule: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    poste: "",
    role: "EMPLOYE",
    status: "ACTIF",
    departmentId: "",
    password: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/personnel/${id}`).then((r) => r.json()),
      fetch("/api/admin/departements").then((r) => r.json()),
    ])
      .then(([userData, deptData]) => {
        if (userData.user) {
          const u = userData.user;
          setFormData({
            matricule: u.matricule || "",
            nom: u.nom || "",
            prenom: u.prenom || "",
            email: u.email || "",
            telephone: u.telephone || "",
            poste: u.poste || "",
            role: u.role || "EMPLOYE",
            status: u.status || "ACTIF",
            departmentId: u.departmentId || "",
            password: "",
          });
        }
        if (deptData.departements) {
          setDepartments(deptData.departements);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erreur de chargement des données.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/personnel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de mise à jour.");
      }

      router.push("/admin/personnel");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier {formData.prenom} {formData.nom}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Matricule: <span className="font-mono">{formData.matricule}</span>
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
                Statut du compte *
              </label>
              <select
                name="status"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.poste}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Réinitialiser le mot de passe
            </label>
            <input
              type="password"
              name="password"
              placeholder="Laisser vide pour ne pas modifier"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.password}
              onChange={handleChange}
            />
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
              disabled={saving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
