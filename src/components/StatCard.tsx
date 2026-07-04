"use client";

import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = "brand",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: "brand" | "green" | "orange" | "red";
}) {
  const colorMap = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-4 w-20 skeleton rounded" />
          <div className="h-8 w-16 skeleton rounded mt-2" />
        </div>
        <div className="w-10 h-10 skeleton rounded-lg" />
      </div>
    </div>
  );
}
