import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  Layers3,
  LifeBuoy,
  LogOut,
  Package2,
  Users,
} from "lucide-react";
import { AppContext } from "../context/AppContextInstance.js";

export default function Sidebar() {
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
    <aside className="fixed top-0 left-0 w-64 h-screen bg-green-800 text-white flex flex-col z-40">
      
      {/* Logo Section */}
      <div className="p-6 flex flex-col items-center gap-2 border-b border-green-900">
        <img
          src="/logo.jpg"
          alt="Sana Kishan Logo"
          className="w-16 h-16 rounded-2xl object-contain border border-white/20"
        />
<span className="text-xl font-bold font-serif tracking-wide">
  महिला सानाकिशन
  <span className="block text-xs font-bold text-red-700 ">लक्ष्मीनिया गाउँपालिका</span>
</span>

      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `mx-3 flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
               hover:bg-green-700
               ${isActive ? "bg-green-900 font-semibold" : ""}`
            }
          >
            <l.icon size={18} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-6 border-t border-green-900">
        <button
          onClick={logout}
          className="w-full px-4 py-2 rounded-lg text-left flex items-center gap-3
                     hover:bg-red-600 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
