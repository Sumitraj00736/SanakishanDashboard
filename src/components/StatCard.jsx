import React from "react";

export default function StatCard({ title, value, bgColor , textColor = "text-white" }) {
  return (
    <div className={`${bgColor} ${textColor} p-6 rounded-xl shadow-lg`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

