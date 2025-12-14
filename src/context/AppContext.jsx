/* eslint-disable no-unused-vars */
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

const BASE_URL = "https://shanakishan-backend.onrender.com/api";

// create axios instances
const publicClient = axios.create({
  baseURL: BASE_URL,
});

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  // authorized axios instance
  const authClient = axios.create({
    baseURL: BASE_URL,
  });
authClient.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set JSON Content-Type if it's NOT FormData
  const isFormData = config.data instanceof FormData;

  if (!isFormData) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});



  const [auth, setAuth] = useState({
    isLoggedIn: false,
    token: null,
  });

  // Load token from localStorage on reload
 // Load token from localStorage on reload
useEffect(() => {
  const token = localStorage.getItem("adminToken");  // ✅ FIXED
  if (token) {
    setAuth({ isLoggedIn: true, token });
    setToken(token); // ✅ VERY IMPORTANT - now authClient gets token
  }
}, []);

  // AUTH
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await publicClient.post("/admin/auth/login", { username, password });
      const t = res.data.token || res.data.accessToken || res.data.data?.token;
      if (t) {
        setToken(t);
        localStorage.setItem("adminToken", t);
        console.log("Login response:", res.data);
        setAdmin(res.data.admin || res.data.user || null);
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error?.response?.data?.message || error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  // PRODUCTS
  const fetchProducts = async () => {
    const res = await authClient.get("/products");
    console.log("Fetched products:", res.data);
    return res.data;
  };


  // Create Product
const createProduct = async (formData) => {
  try {
    const res = await authClient.post("/admin/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error creating product:", err.response?.data || err);
    throw err;
  }
};

  // Update Product
  const updateProduct = async (id, payload) => {
    const res = await authClient.put(`/admin/products/${id}`, payload);
    return res.data;
  };
  // Delete Product
  const deleteProduct = async (id) => {
    const res = await authClient.delete(`/admin/products/${id}`);
    return res.data;
  };

  // MEMBERS
  const fetchMembers = async () => {
    const res = await authClient.get("/admin/members");
    return res.data;
  };
  const createMember = async (payload) => {
    console.log("Creating member with payload:", payload);
    const res = await authClient.post("/admin/members", payload);
    console.log("Created member:", res.data);
    return res.data;
  };
  const updateMember = async (id, payload) => {
    const res = await authClient.put(`/admin/members/${id}`, payload);
    return res.data;
  };
  const deleteMember = async (id) => {
    const res = await authClient.delete(`/admin/members/${id}`);
    return res.data;
  };

  // BOOKINGS
  const fetchBookings = async (params) => {
    const res = await authClient.get("/admin/bookings", { params });
    return res.data;
  };
  const cancelBooking = async (id, reason) => {
    const res = await authClient.post(`/admin/bookings/${id}/cancel`, { reason });
    return res.data;
  };
  const verifyPayment = async (id, payload) => {
    const res = await authClient.post(`/admin/bookings/${id}/verify-payment`, payload);
    return res.data;
  };

  // CATEGORIES
  const fetchCategories = async () => {
    const res = await authClient.get("/categories");
    return res.data;
  };
  const createCategory = async (payload) => {
    const res = await authClient.post("/admin/categories", payload);
    return res.data;
  };

  const updateCategory = async (id, body) => {
  const res = await authClient.put(`/admin/categories/${id}`, body);
  return res.data;
};

  // SUPPORT
  const fetchSupport = async () => {
    const res = await authClient.get("/admin/support");
    return res.data;
  };
  const updateTicket = async (id, payload) => {
    const res = await authClient.put(`/admin/support/${id}`, payload);
    return res.data;
  };

  // Dashboard stats (simple counts)
  const fetchStats = async () => {
    const [products, bookings, members] = await Promise.all([
      fetchProducts(), fetchBookings(), fetchMembers()
    ]);
    return {
      products: Array.isArray(products) ? products.length : (products.count || 0),
      bookings: Array.isArray(bookings) ? bookings.length : (bookings.count || 0),
      members: Array.isArray(members) ? members.length : (members.count || 0)
    };
  };

  useEffect(() => {
    // if token exists you might fetch admin profile optionally
  }, [token]);

  return (
    <AppContext.Provider value={{
      token, admin, loading,
      login, logout,
      // products
      fetchProducts, createProduct, updateProduct, deleteProduct,
      // members
      fetchMembers, createMember, updateMember, deleteMember,
      // bookings
      fetchBookings, cancelBooking, verifyPayment,
      // categories
      fetchCategories, createCategory, updateCategory,
      // support
      fetchSupport, updateTicket,
      // dashboard
      fetchStats,
      // axios clients if needed
      publicClient, authClient
    }}>
      {children}
    </AppContext.Provider>
  );
}
