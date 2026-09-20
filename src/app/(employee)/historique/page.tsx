"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  status: string;
  site: { name: string };
}

const statusBadge: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "Présent", color: "bg-green-100 text-green-800" },
  RETARD: { label: "Retard", color: "bg-orange-100 text-orange-800" },
  ABSENT: { label: "Absent", color: "bg-red-100 text-red-800" },
  CONGE: { label: "Congé", color: "bg-blue-100 text-blue-800" },
  MISSION: { label: "Mission", color: "bg-purple-100 text-purple-800" },
};

export default function HistoriquePage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employe/historique")
      .then((res) => res.json())
      .then((data) => {
        if (data.attendances) {
          setAttendances(data.attendances);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Historique</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Vos pointages récents des 30 derniers jours
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : attendances.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm text-gray-400">
          <span className="text-4xl">🕒</span>
          <p className="mt-2 font-medium">Aucun pointage enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendances.map((item) => {
            const badge = statusBadge[item.status] || {
              label: item.status,
              color: "bg-gray-100 text-gray-700",
            };
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800 capitalize">
                    {formatDate(item.date)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.site?.name}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-mono text-gray-700">
                      {item.checkIn ? formatTime(item.checkIn) : "--:--"}
                      <span className="text-gray-300 mx-1">→</span>
                      {item.checkOut ? formatTime(item.checkOut) : "--:--"}
                    </div>
                    {item.lateMinutes > 0 && (
                      <span className="text-xs text-orange-600 font-medium">
                        +{item.lateMinutes} min
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
