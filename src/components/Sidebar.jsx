import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Layers3,
  LifeBuoy,
  LogOut,
  Package2,
  Users,
} from "lucide-react";
import { AppContext } from "../context/AppContextInstance.js";

export default function Sidebar({ collapsed = false, onToggle }) {
  const { logout } = useContext(AppContext);

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package2 },
    { to: "/members", label: "Members", icon: Users },
    { to: "/bookings", label: "Bookings", icon: CalendarDays },
    { to: "/support", label: "Support", icon: LifeBuoy },
    { to: "/categories", label: "Categories", icon: Layers3 },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-[#0f3f23] bg-[#1f5f3b] text-white shadow-md transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      
      <div className={`relative border-b border-white/10 bg-[#184d30] ${collapsed ? "p-4" : "p-6"}`}>
        <button
          onClick={onToggle}
          className="absolute right-3 top-3 border border-white/15 bg-white/10 p-1.5 text-white hover:bg-white/20"
          aria-label={collapsed ? "Open sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`flex flex-col items-center gap-2 ${collapsed ? "pt-6" : ""}`}>
        <img
          src="/logo.jpg"
          alt="Sana Kishan Logo"
          className={`${collapsed ? "h-12 w-12" : "h-16 w-16"} border border-white/20 bg-white object-contain p-1`}
        />
        {!collapsed && (
          <span className="text-center text-xl font-bold font-serif tracking-wide">
            महिला सानाकिशन
            <span className="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              लक्ष्मीनिया गाउँपालिका
            </span>
          </span>
        )}
        </div>
      </div>

      <nav className="flex-1 mt-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `mx-3 flex items-center border-l-4 py-3 transition-all duration-200 ${
                isActive
                  ? "border-[#dbe9d8] bg-[#2a6a45] font-semibold text-white"
                  : "border-transparent text-emerald-50/90 hover:bg-[#2a6a45] hover:text-white"
              } ${collapsed ? "justify-center px-2" : "gap-3 px-4"}`
            }
            title={collapsed ? l.label : undefined}
          >
            <l.icon size={18} />
            {!collapsed && <span>{l.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`border-t border-white/10 ${collapsed ? "p-3" : "p-6"}`}>
        {!collapsed && (
          <div className="mb-3 border border-white/10 bg-[#184d30] px-4 py-3 text-sm text-emerald-50/90">
            Dashboard access is active. Use logout after finishing your work.
          </div>
        )}
        <button
          onClick={logout}
          className={`flex w-full items-center border border-[#b14545] bg-[#a33636] py-3 text-left transition-all duration-200 hover:bg-[#912d2d] ${
            collapsed ? "justify-center px-2" : "gap-3 px-4"
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
