import React from "react";

export default function StatCard({ title, value, bgColor, icon, note }) {
  return (
    <div className={`border border-white/10 px-5 py-5 shadow-sm ${bgColor}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/85">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          {note && <p className="mt-2 text-xs text-white/80">{note}</p>}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center border border-white/20 bg-white/10 text-white">
            <div className="text-2xl">{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}
