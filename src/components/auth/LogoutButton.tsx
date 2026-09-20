"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        className ||
        "text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition"
      }
      title="Se déconnecter"
    >
      Déconnexion ⎋
    </button>
  );
}
