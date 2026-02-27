import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { AppContext } from "./AppContextInstance.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sanaapi.thesanatanisolutions.com/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL.replace(/\/api\/?$/, "");


const publicClient = axios.create({
  baseURL: BASE_URL,
});

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const socketRef = useRef(null);

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore when browser blocks autoplay
    }
  };

  const authClient = useMemo(() => {
    const instance = axios.create({ baseURL: BASE_URL });
    instance.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }
      return config;
    });
    return instance;
  }, [token]);

  const isAuthenticated = Boolean(token);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await publicClient.post("/admin/auth/login", { username, password });
      const nextToken = res.data.token || res.data.accessToken || res.data.data?.token;
      if (!nextToken) throw new Error("Token not returned from API");

      localStorage.setItem("adminToken", nextToken);
      setToken(nextToken);
      setAdmin(res.data.admin || res.data.user || null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || error.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setAdmin(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    if (!token) return undefined;
    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      auth: {},
    });
    socketRef.current = socket;

    socket.on("booking:created", ({ booking }) => {
      playNotificationSound();
      toast.info(`New booking: ${booking?.userName || booking?._id || "Unknown"}`);
      window.dispatchEvent(new CustomEvent("booking:created", { detail: booking }));
    });

    socket.on("booking:updated", ({ booking }) => {
      playNotificationSound();
      toast.info(`Booking updated: ${booking?.userName || booking?._id || "Unknown"}`);
      window.dispatchEvent(new CustomEvent("booking:updated", { detail: booking }));
    });

    socket.on("admin:booking-notification", (payload) => {
      playNotificationSound();
      toast.info(payload?.message || "Booking notification");
      if (payload?.notification) {
        setNotifications((prev) => [payload.notification, ...prev].slice(0, 100));
        setUnreadNotifications((prev) => prev + 1);
      }
      window.dispatchEvent(new CustomEvent("admin:booking-notification", { detail: payload }));
    });

    socket.on("support:created", ({ ticket }) => {
      playNotificationSound();
      toast.info(`New support ticket from ${ticket?.name || "user"}`);
      window.dispatchEvent(new CustomEvent("support:created", { detail: ticket }));
    });

    socket.on("support:updated", ({ ticket }) => {
      playNotificationSound();
      toast.success(`Support ticket ${ticket?._id || ""} updated`);
      window.dispatchEvent(new CustomEvent("support:updated", { detail: ticket }));
    });

    socket.on("admin:support-notification", (payload) => {
      playNotificationSound();
      toast.info(payload?.message || "Support notification");
      if (payload?.notification) {
        setNotifications((prev) => [payload.notification, ...prev].slice(0, 100));
        setUnreadNotifications((prev) => prev + 1);
      }
      window.dispatchEvent(new CustomEvent("admin:support-notification", { detail: payload }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const fetchAdminNotifications = useCallback(async (params = {}) => {
    const data = (await authClient.get("/admin/notifications", { params })).data;
    setNotifications(data?.notifications || []);
    setUnreadNotifications(Number(data?.unreadCount || 0));
    return data;
  }, [authClient]);

  const markAdminNotificationRead = useCallback(async (id) => {
    const data = (await authClient.patch(`/admin/notifications/${id}/read`)).data;
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)));
    setUnreadNotifications((prev) => Math.max(prev - 1, 0));
    return data;
  }, [authClient]);

  const markAllAdminNotificationsRead = useCallback(async () => {
    const data = (await authClient.patch("/admin/notifications/read-all")).data;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt || new Date().toISOString() })));
    setUnreadNotifications(0);
    return data;
  }, [authClient]);

  const fetchProducts = async () => (await authClient.get("/products")).data;
  const createProduct = async (formData) =>
    (
      await authClient.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  const updateProduct = async (id, payload) => (await authClient.put(`/admin/products/${id}`, payload)).data;
  const deleteProduct = async (id) => (await authClient.delete(`/admin/products/${id}`)).data;

  const fetchMembers = async () => (await authClient.get("/admin/members")).data;
  const createMember = async (payload) => (await authClient.post("/admin/members", payload)).data;
  const updateMember = async (id, payload) => (await authClient.put(`/admin/members/${id}`, payload)).data;
  const deleteMember = async (id) => (await authClient.delete(`/admin/members/${id}`)).data;

  const fetchBookings = async (params) => (await authClient.get("/admin/bookings", { params })).data;
  const cancelBooking = async (id, reason) =>
    (await authClient.post(`/admin/bookings/${id}/cancel`, { reason })).data;
  const verifyPayment = async (id, payload) =>
    (await authClient.post(`/admin/bookings/${id}/verify-payment`, payload)).data;

  const fetchCategories = async () => (await authClient.get("/categories")).data;
  const createCategory = async (payload) => (await authClient.post("/admin/categories", payload)).data;
  const updateCategory = async (id, body) => (await authClient.put(`/admin/categories/${id}`, body)).data;
  const deleteCategory = async (id) => (await authClient.delete(`/admin/categories/${id}`)).data;

  const fetchSupport = async () => (await authClient.get("/admin/support")).data;
  const updateTicket = async (id, payload) => (await authClient.put(`/admin/support/${id}`, payload)).data;

  const fetchAnalytics = async (params) => (await authClient.get("/admin/analytics/overview", { params })).data;

  const downloadBookingReportCsv = async (params) => {
    const response = await authClient.get("/admin/reports/bookings.csv", {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  };

  const value = {
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
    deleteCategory,
    fetchSupport,
    updateTicket,
    fetchAnalytics,
    downloadBookingReportCsv,
    notifications,
    unreadNotifications,
    fetchAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    publicClient,
    authClient,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
