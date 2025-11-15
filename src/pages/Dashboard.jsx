import React, { useEffect, useState, useContext } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import { AppContext } from "../context/AppContext.jsx";
import Loader from "../components/Loader.jsx";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Package, BookOpen, Users } from "lucide-react"; // Icons

export default function Dashboard() {
  const { fetchStats } = useContext(AppContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await fetchStats();
      setStats(s);
    })();
  }, []);

  if (!stats) return (
    <AdminLayout>
      <Loader />
    </AdminLayout>
  );

  const pieData = [
    { name: "Products", value: stats.products },
    { name: "Bookings", value: stats.bookings },
    { name: "Members", value: stats.members },
  ];

  const COLORS = ["#22c55e", "#2563eb", "#dc2626"];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Products" 
          value={stats.products} 
          bgColor="bg-green-800" 
          icon={<Package />} 
        />
        <StatCard 
          title="Bookings" 
          value={stats.bookings} 
          bgColor="bg-blue-800" 
          icon={<BookOpen />} 
        />
        <StatCard 
          title="Members" 
          value={stats.members} 
          bgColor="bg-red-800" 
          icon={<Users />} 
        />
      </div>

      {/* Pie Chart */}
      <div className="mt-10 bg-white p-5 shadow-lg rounded-xl w-full">
        <h2 className="text-xl font-semibold mb-4">Statistics Chart</h2>

        <div className="w-full flex items-center justify-center">
          {/* Responsive Height */}
          <div className="w-full h-[280px] md:h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  innerRadius="40%"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
