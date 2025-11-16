import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function Sidebar() {
  const { logout } = useContext(AppContext);

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/products", label: "Products" },
    { to: "/members", label: "Members" },
    { to: "/bookings", label: "Bookings" },
  ];

  return (
    <aside className="w-64 fixed top-0 left-0 h-full bg-green-800 text-white z-40">
      {" "}
      <div className="p-6 text-xl font-bold">SanaKishan</div>
      <div className="w-full h-[0.3%] bg-gray-900 "></div>
      <nav className="mt-6">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-6 py-3 hover:bg-red-900 bg-opacity-10 ${
                isActive ? "bg-red-900" : ""
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="absolute bottom-6 w-full px-6">

        
        <button
          onClick={logout}
          className="w-full text-left py-2 rounded hover:bg-red-600"
        >
        <div className="w-full h-[0.3%] bg-gray-900 "></div>

          Logout
        </button>
      </div>
    </aside>
  );
}
