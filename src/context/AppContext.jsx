/* eslint-disable no-unused-vars */
import React, { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";

export const AppContext = createContext();

const BASE_URL = "https://sanaapi.thesanatanisolutions.com/api";

// public axios (no auth)
const publicClient = axios.create({
  baseURL: BASE_URL,
});

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ----------------------------------
     AUTH AXIOS CLIENT (MEMOIZED)
  ---------------------------------- */
  const authClient = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
    });

    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // set JSON header only if not FormData
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }

      return config;
    });

    return instance;
  }, [token]);

  /* ----------------------------------
     AUTH HELPERS
  ---------------------------------- */
  const isAuthenticated = Boolean(token);

  /* ----------------------------------
     LOGIN
  ---------------------------------- */
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await publicClient.post("/admin/auth/login", {
        username,
        password,
      });

      const t =
        res.data.token ||
        res.data.accessToken ||
        res.data.data?.token;

      if (!t) throw new Error("Token not returned from API");

      localStorage.setItem("adminToken", t);
      setToken(t);
      setAdmin(res.data.admin || res.data.user || null);

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message:
          error?.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  /* ----------------------------------
     LOGOUT
  ---------------------------------- */
  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setAdmin(null);
    window.location.href = "/login";
  };

  /* ----------------------------------
     API METHODS
  ---------------------------------- */

  // PRODUCTS
  const fetchProducts = async () => {
    const res = await authClient.get("/products");
    return res.data;
  };

  const createProduct = async (formData) => {
    const res = await authClient.post("/admin/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  const updateProduct = async (id, payload) => {
    const res = await authClient.put(`/admin/products/${id}`, payload);
    return res.data;
  };

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
    const res = await authClient.post("/admin/members", payload);
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
    const res = await authClient.post(`/admin/bookings/${id}/cancel`, {
      reason,
    });
    return res.data;
  };

  const verifyPayment = async (id, payload) => {
    const res = await authClient.post(
      `/admin/bookings/${id}/verify-payment`,
      payload
    );
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

  // DASHBOARD
  const fetchStats = async () => {
    const [products, bookings, members] = await Promise.all([
      fetchProducts(),
      fetchBookings(),
      fetchMembers(),
    ]);

    return {
      products: products?.length || 0,
      bookings: bookings?.length || 0,
      members: members?.length || 0,
    };
  };

  /* ----------------------------------
     PROVIDER
  ---------------------------------- */
  return (
    <AppContext.Provider
      value={{
        token,
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        fetchMembers,
        createMember,
        updateMember,
        deleteMember,
        fetchBookings,
        cancelBooking,
        verifyPayment,
        fetchCategories,
        createCategory,
        updateCategory,
        fetchSupport,
        updateTicket,
        fetchStats,
        publicClient,
        authClient,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
