import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Products from "../pages/Products.jsx";
import AddProduct from "../pages/AddProduct.jsx";
import Members from "../pages/Members.jsx";
import Bookings from "../pages/Bookings.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import Support from "../pages/Support.jsx";
import Categories from "../pages/Categories.jsx";
import PrivateRoute from "./PrivateRoutes.jsx";

const Router = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* PROTECTED ADMIN AREA */}
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
        <Route path="support" element={<Support />} />
        <Route path="categories" element={<Categories />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default Router;
