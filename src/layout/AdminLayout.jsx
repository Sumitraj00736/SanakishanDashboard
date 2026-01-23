import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      {/* Main content offset by sidebar width */}
      <div className="ml-64 min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
