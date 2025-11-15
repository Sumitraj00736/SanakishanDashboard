import React, { useEffect, useState, useContext } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import { AppContext } from "../context/AppContext.jsx";
import Loader from "../components/Loader.jsx";

export default function Dashboard() {
  const { fetchStats } = useContext(AppContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await fetchStats();
      console.log(s);
      console.log("Stats fetched:", s);
      
      setStats(s);
    })();
  }, []);

  if (!stats) return <AdminLayout><Loader/></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-6">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Products" value={stats.products} />
        <StatCard title="Bookings" value={stats.bookings} />
        <StatCard title="Members" value={stats.members} />
      </div>
    </AdminLayout>
  );
}
