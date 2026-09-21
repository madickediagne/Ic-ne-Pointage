"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/personnel", icon: "👥", label: "Personnel" },
  { href: "/admin/pointages", icon: "🕒", label: "Pointages" },
  { href: "/admin/rapports", icon: "📈", label: "Rapports" },
  { href: "/admin/horaires", icon: "⏰", label: "Horaires" },
  { href: "/admin/conges", icon: "🏖️", label: "Congés" },
  { href: "/admin/site", icon: "📍", label: "Site & QR" },
];

export default function AdminMobileHeader({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Header mobile sticky */}
      <header className="md:hidden bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm">
        <div>
          <p className="font-bold text-primary-900 text-base leading-tight">Icône Pointage</p>
          <p className="text-[10px] text-primary-600 font-medium">Administration</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            <strong className="text-gray-700">{userName}</strong>
          </span>
          {/* Bouton hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Ouvrir le menu"
          >
            <span className="text-gray-700 text-lg">☰</span>
          </button>
        </div>
      </header>

      {/* Overlay (fond sombre) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer latéral qui apparaît depuis la gauche */}
      <div
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* En-tête du drawer */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-primary-900 text-lg">Icône Pointage</h1>
            <p className="text-xs text-primary-600 font-medium">Espace Administration</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium text-sm transition active:scale-95"
            >
              <span className="text-xl w-7 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Pied du drawer */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 text-sm transition"
          >
            <span>📱</span> Mode Employé (Pointer)
          </Link>
          <LogoutButton className="w-full text-center py-2.5 px-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition block" />
        </div>
      </div>
    </>
  );
}
