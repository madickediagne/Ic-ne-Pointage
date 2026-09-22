"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AdminProfilPage() {
  const [tab, setTab] = useState<"matricule" | "password">("matricule");
  const [form, setForm] = useState({
    matricule: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    if (tab === "password" && form.newPassword !== form.confirmPassword) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      setSaving(false);
      return;
    }

    const payload: any = { currentPassword: form.currentPassword };
    if (tab === "matricule") payload.matricule = form.matricule;
    if (tab === "password") payload.newPassword = form.newPassword;

    try {
      const res = await fetch("/api/admin/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour.");
      } else {
        setSuccess(data.message);
        setForm({ matricule: "", currentPassword: "", newPassword: "", confirmPassword: "" });

        // Si le matricule a changé, déconnecter pour se reconnecter avec le nouveau
        if (data.matriculeChanged) {
          setTimeout(() => signOut({ callbackUrl: "/login" }), 2000);
        }
      }
    } catch {
      setError("Erreur serveur inattendue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil Administrateur</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Modifiez vos identifiants de connexion. Votre mot de passe actuel est requis pour toute modification.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setTab("matricule"); setError(null); setSuccess(null); }}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "matricule" ? "bg-white shadow text-primary-700" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🪪 Changer le matricule
        </button>
        <button
          onClick={() => { setTab("password"); setError(null); setSuccess(null); }}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "password" ? "bg-white shadow text-primary-700" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🔑 Changer le mot de passe
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ spécifique au tab actif */}
          {tab === "matricule" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nouveau Matricule
              </label>
              <input
                type="text"
                required
                placeholder="Ex: ICN002"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase"
                value={form.matricule}
                onChange={(e) => setForm({ ...form, matricule: e.target.value.toUpperCase() })}
              />
            </div>
          )}

          {tab === "password" && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  placeholder="Au moins 6 caractères"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  placeholder="Répétez le nouveau mot de passe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Mot de passe actuel — toujours requis */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Votre mot de passe actuel <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Requis pour confirmer les modifications"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition disabled:opacity-50 shadow-sm"
          >
            {saving ? "Enregistrement..." : "✓ Enregistrer les modifications"}
          </button>
        </form>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
        ⚠️ Si vous changez votre <strong>matricule</strong>, vous serez automatiquement déconnecté et devrez vous reconnecter avec le nouveau matricule.
      </div>
    </div>
  );
}
