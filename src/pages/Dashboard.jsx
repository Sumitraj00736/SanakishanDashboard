import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CircleDollarSign,
  Download,
  PackageCheck,
  Ticket,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import Loader from "../components/Loader.jsx";
import StatCard from "../components/StatCard.jsx";
import { AppContext } from "../context/AppContextInstance.js";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { fetchAnalytics, downloadBookingReportCsv } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: todayInputValue(),
    status: "pending,confirmed,cancelled,completed",
  });

  const loadAnalytics = async (params = filters) => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAnalytics(params);
      setAnalytics(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusPie = useMemo(() => {
    const raw = analytics?.breakdowns?.byStatus || {};
    return Object.entries(raw).map(([name, value]) => ({ name, value }));
  }, [analytics]);

  const chartSeries = analytics?.series || [];
  const topProducts = analytics?.breakdowns?.topProducts || [];
  const summary = analytics?.summary || {};

  const onApplyFilters = async () => {
    await loadAnalytics(filters);
  };

  const exportReport = async (status) => {
    try {
      setExporting(true);
      const params = { ...filters };
      if (status) params.status = status;
      await downloadBookingReportCsv(params);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to download CSV");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
            <p className="text-sm text-slate-600">Track bookings, sales and cancellations with filters.</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="pending,confirmed,cancelled,completed">All Statuses</option>
              <option value="confirmed,completed">Confirmed/Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
            <button
              onClick={onApplyFilters}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Sales" value={`NPR ${Number(summary.totalSales || 0).toLocaleString()}`} bgColor="bg-emerald-700" icon={<CircleDollarSign />} />
        <StatCard title="Total Bookings" value={summary.totalBookings || 0} bgColor="bg-blue-700" icon={<Ticket />} />
        <StatCard title="Confirmed" value={summary.confirmedBookings || 0} bgColor="bg-teal-700" icon={<PackageCheck />} />
        <StatCard title="Cancelled" value={summary.cancelledBookings || 0} bgColor="bg-rose-700" icon={<XCircle />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Daily Sales & Bookings</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#0f766e" strokeWidth={3} name="Sales" />
                <Line type="monotone" dataKey="bookings" stroke="#1d4ed8" strokeWidth={3} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Status Distribution</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" outerRadius={120} label>
                  {statusPie.map((_, index) => (
                    <Cell key={index} fill={["#2563eb", "#0f766e", "#f59e0b", "#dc2626"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-800">Top Products by Sales</h2>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => exportReport("")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              <Download size={16} />
              Export Filtered CSV
            </button>
            <button
              onClick={() => exportReport("cancelled")}
              disabled={exporting}
              className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            >
              Export Cancelled CSV
            </button>
          </div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
