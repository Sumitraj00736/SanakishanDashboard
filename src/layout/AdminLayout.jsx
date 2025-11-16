import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar /> {/* Sidebar always visible */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Navbar always visible */}
]        <main
        className="pr-74 ml-64 w-full p-6 bg-gray-100 h-full z-30"
        // style={{ marginLeft: "256px" }} 
      >
                {/* <Navbar /> */}

         
        <Outlet />
      </main>
      </div>
    </div>
  );
}
