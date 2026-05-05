import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Filter,
  Download,
  PackageCheck,
  RefreshCw,
  Ticket,
  TrendingUp,
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

function formatCurrency(value) {
  return `रु ${Number(value || 0).toLocaleString()}`;
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
  const totalSales = Number(summary.totalSales || 0);
  const topProductName = topProducts[0]?.name || "No product data";
  const selectedStatusLabel =
    filters.status === "pending,confirmed,cancelled,completed"
      ? "All Statuses"
      : filters.status === "confirmed,completed"
        ? "Confirmed / Completed"
        : filters.status === "cancelled"
          ? "Cancelled"
          : "Pending";

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
      <div className="border border-[#d8e3d4] bg-white shadow-sm">
        <div className="border-b border-[#dfe8db] bg-[#f6faf4] px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2f6942]">
                Dashboard Summary
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#173b23]">Analytics Overview</h1>
              <p className="mt-1 text-sm text-slate-600">
                Review bookings, sales trends, and operational activity from one place.
              </p>
            </div>

            <button
              onClick={() => loadAnalytics()}
              className="inline-flex items-center gap-2 border border-[#cfd8cb] bg-white px-4 py-2.5 text-sm font-semibold text-[#234a2f] transition hover:bg-[#f5f8f4]"
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-b border-[#dfe8db] px-6 py-5 md:grid-cols-3">
          <div className="border-l-4 border-[#1f5f3b] bg-[#f8fbf7] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6942]">Current Filter</p>
            <p className="mt-2 text-sm font-semibold text-[#173b23]">{selectedStatusLabel}</p>
            <p className="mt-1 text-xs text-slate-500">Range: {filters.from || "Start not set"} to {filters.to || "Today"}</p>
          </div>
          <div className="border-l-4 border-[#366d49] bg-[#f8fbf7] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6942]">Sales Snapshot</p>
            <p className="mt-2 text-sm font-semibold text-[#173b23]">{formatCurrency(totalSales)}</p>
            <p className="mt-1 text-xs text-slate-500">Based on the selected dashboard filters.</p>
          </div>
          <div className="border-l-4 border-[#4f7f5e] bg-[#f8fbf7] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6942]">Top Product</p>
            <p className="mt-2 text-sm font-semibold text-[#173b23]">{topProductName}</p>
            <p className="mt-1 text-xs text-slate-500">Highest sales item in the current summary.</p>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#2f6942]" />
            <h2 className="text-base font-semibold text-[#173b23]">Filter Controls</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              className="border border-[#cfd8cb] bg-[#fbfdfb] px-3 py-2.5 text-sm outline-none transition focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              className="border border-[#cfd8cb] bg-[#fbfdfb] px-3 py-2.5 text-sm outline-none transition focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="border border-[#cfd8cb] bg-[#fbfdfb] px-3 py-2.5 text-sm outline-none transition focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
            >
              <option value="pending,confirmed,cancelled,completed">All Statuses</option>
              <option value="confirmed,completed">Confirmed/Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
            <button
              onClick={onApplyFilters}
              className="border border-[#184d30] bg-[#1f5f3b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#184d30]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {error && <div className="border border-[#dcb7b7] bg-[#fbf0f0] p-3 text-sm text-[#8b2f2f]">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Sales" value={formatCurrency(totalSales)} note="Overall sales for selected records" bgColor="bg-[#1f5f3b]" icon={<span className="text-xl font-bold">रु</span>} />
        <StatCard title="Total Bookings" value={summary.totalBookings || 0} note="All bookings within current filters" bgColor="bg-[#295f42]" icon={<Ticket />} />
        <StatCard title="Confirmed" value={summary.confirmedBookings || 0} note="Verified or completed reservations" bgColor="bg-[#3a714f]" icon={<PackageCheck />} />
        <StatCard title="Cancelled" value={summary.cancelledBookings || 0} note="Cancelled records in selected period" bgColor="bg-[#8f3838]" icon={<XCircle />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="border border-[#d8e3d4] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#2f6942]" />
            <h2 className="text-lg font-semibold text-[#173b23]">Daily Sales & Bookings</h2>
          </div>
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

        <div className="border border-[#d8e3d4] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[#2f6942]" />
            <h2 className="text-lg font-semibold text-[#173b23]">Status Distribution</h2>
          </div>
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

      <div className="border border-[#d8e3d4] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2f6942]" />
            <h2 className="text-lg font-semibold text-[#173b23]">Top Products by Sales</h2>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              onClick={() => exportReport("")}
              disabled={exporting}
              className="inline-flex items-center gap-2 border border-[#2f6942] px-3 py-2 text-sm font-semibold text-[#2f6942] transition hover:bg-[#f3f8f2] disabled:opacity-50"
            >
              <Download size={16} />
              Export Filtered CSV
            </button>
            <button
              onClick={() => exportReport("cancelled")}
              disabled={exporting}
              className="border border-[#8f3838] bg-[#a33636] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#912d2d] disabled:opacity-50"
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
