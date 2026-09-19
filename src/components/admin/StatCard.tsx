"use client";

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: "blue" | "green" | "orange" | "red" | "purple";
}

const colorMap = {
  blue:   "bg-blue-50 border-blue-100 text-blue-700",
  green:  "bg-green-50 border-green-100 text-green-700",
  orange: "bg-orange-50 border-orange-100 text-orange-700",
  red:    "bg-red-50 border-red-100 text-red-700",
  purple: "bg-purple-50 border-purple-100 text-purple-700",
};

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${colorMap[color]}`}>
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-3xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}
