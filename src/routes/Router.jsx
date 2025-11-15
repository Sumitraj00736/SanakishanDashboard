import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Products from "../pages/Products.jsx";
import AddProduct from "../pages/AddProduct.jsx";
import Members from "../pages/Members.jsx";
import Bookings from "../pages/Bookings.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";

// Protect admin routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/login" replace />;
};

const Router = () => {
  return (
    <Routes>

      {/* ---------- PUBLIC ROUTE ---------- */}
      <Route path="/login" element={<Login />} />

      {/* ---------- PROTECTED ADMIN ROUTES ---------- */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="members" element={<Members />} />
        <Route path="bookings" element={<Bookings />} />
      </Route>

      {/* ---------- FALLBACK ROUTE ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default Router;
