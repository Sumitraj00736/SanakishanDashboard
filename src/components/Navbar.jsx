import React, { useContext, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, PanelLeftClose, PanelLeftOpen, LogOut, ShieldCheck } from "lucide-react";
import { AppContext } from "../context/AppContextInstance";

const PAGE_META = {
  "/": {
    title: "Dashboard Overview",
    subtitle: "Track bookings, products, members, and live updates in one place.",
  },
  "/products": {
    title: "Products",
    subtitle: "Manage inventory, pricing, and product visuals from one workspace.",
  },
  "/products/add": {
    title: "Add Product",
    subtitle: "Create a product entry with pricing, details, and availability.",
  },
  "/members": {
    title: "Members",
    subtitle: "Review member records and keep account data organized.",
  },
  "/bookings": {
    title: "Bookings",
    subtitle: "Monitor reservations, payment status, and operational activity.",
  },
  "/support": {
    title: "Support",
    subtitle: "Stay on top of support tickets and customer follow-ups.",
  },
  "/categories": {
    title: "Categories",
    subtitle: "Organize the catalog structure used across the platform.",
  },
};

export default function Navbar({ sidebarCollapsed = false, onToggleSidebar, onRequestLogout }) {
  const {
    admin,
    notifications,
    unreadNotifications,
    fetchAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
  } = useContext(AppContext);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const notificationRef = useRef(null);

  React.useEffect(() => {
    fetchAdminNotifications().catch(() => {});
  }, [fetchAdminNotifications]);

  React.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const latest = useMemo(() => notifications.slice(0, 15), [notifications]);
  const pageMeta = PAGE_META[location.pathname] || PAGE_META["/"];
  const adminName = admin?.username || admin?.name || admin?.email || "Administrator";

  const onMarkRead = async (id, read) => {
    if (read) return;
    await markAdminNotificationRead(id);
  };

  return (
    <div className="sticky top-0 z-30 border-b border-[#cfd8cb] bg-[#f8fbf7] px-6 py-4">
      <div className="border border-[#d9e3d5] bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-[260px] items-start gap-3">
            <button
              onClick={onToggleSidebar}
              className="mt-1 border border-[#cfd8cb] bg-[#f7faf6] p-2 text-[#234a2f] transition hover:bg-[#eef5ee]"
              aria-label={sidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <div>
              <div className="inline-flex items-center gap-2 border-l-4 border-[#1f5f3b] bg-[#eef5ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f5f3b]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Panel
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#16371f]">{pageMeta.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{pageMeta.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden border border-[#d9e3d5] bg-[#f7faf6] px-4 py-3 text-right lg:block">
              <div className="flex items-center justify-end gap-2 text-[#1f5f3b]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em]">Authorized Session</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#16371f]">{adminName}</p>
              <p className="text-xs text-slate-500">Administrative access active</p>
            </div>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className={`relative border p-3 text-[#234a2f] transition ${
                  open
                    ? "border-[#2f6942] bg-[#eef5ee]"
                    : "border-[#cfd8cb] bg-white hover:bg-[#f4f8f2]"
                }`}
                aria-label="Toggle notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 z-50 mt-3 max-h-[560px] w-[420px] overflow-hidden border border-[#cfd8cb] bg-white shadow-lg">
                  <div className="flex items-center justify-between bg-[#1f5f3b] px-4 py-3 text-white">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button
                      onClick={markAllAdminNotificationsRead}
                      className="border border-white/25 px-2 py-1 text-xs hover:bg-white/10"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto">
                    {latest.length === 0 ? (
                      <div className="px-4 py-10 text-sm text-slate-500 text-center">
                        No notifications yet
                      </div>
                    ) : (
                      latest.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => onMarkRead(item._id, item.read)}
                          className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                            item.read ? "opacity-70" : "bg-[#f1f7f1]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                              <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                              <p className="text-[11px] text-slate-400 mt-2">
                                {new Date(item.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!item.read && (
                              <span className="bg-[#dcedd8] px-2 py-1 text-[10px] font-semibold text-[#1f5f3b]">
                                NEW
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onRequestLogout}
              className="inline-flex items-center gap-2 border border-[#8f2f2f] bg-[#a33636] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#912d2d]"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
