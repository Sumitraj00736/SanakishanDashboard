import React from "react";

export default function StatCard({ title, value, bgColor, icon }) {
  return (
    <div className={`p-6 rounded-xl shadow-lg flex items-center gap-4 ${bgColor}`}>
      {icon && <div className="text-white text-3xl">{icon}</div>}
      <div>
        <p className="text-white font-semibold">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
