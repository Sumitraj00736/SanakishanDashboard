import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar /> {/* Sidebar always visible */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar /> {/* Navbar always visible */}
        <main
        className="ml-64 w-full p-6 bg-gray-100 min-h-screen z-30"
        style={{ marginLeft: "256px" }} 
      >
        <Outlet />
      </main>
      </div>
    </div>
  );
}
