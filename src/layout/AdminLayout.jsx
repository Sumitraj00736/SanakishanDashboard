import React, { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContextInstance.js";

export default function AdminLayout() {
  const { logout } = useContext(AppContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleRequestLogout = () => {
    if (loggingOut) return;
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setLoggingOut(true);
    window.setTimeout(() => {
      logout();
    }, 1000);
  };

  const handleCloseLogoutModal = () => {
    if (loggingOut) return;
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f6f2]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        onRequestLogout={handleRequestLogout}
      />

      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          onRequestLogout={handleRequestLogout}
        />

        <main className="flex-1 overflow-x-hidden px-6 pb-8 pt-6">
          <Outlet />
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[#e7c6c6] bg-[#fbf0f0] text-[#a33636]">
                  <LogOut size={18} />
                </div>
                <h2 className="text-xl font-bold text-[#173b23]">Confirm Logout</h2>
              </div>
              <button
                onClick={handleCloseLogoutModal}
                disabled={loggingOut}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close logout confirmation"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Are you sure you want to logout from the dashboard?
            </p>

            {loggingOut && (
              <div className="mt-4 border border-[#d8e3d4] bg-[#f6faf4] px-4 py-3 text-sm text-[#234a2f]">
                Logging out, please wait...
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseLogoutModal}
                disabled={loggingOut}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="border border-[#8f2f2f] bg-[#a33636] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loggingOut ? "Logging Out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
