import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContextInstance";

export default function Navbar() {
  const {
    notifications,
    unreadNotifications,
    fetchAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
  } = useContext(AppContext);
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    fetchAdminNotifications().catch(() => {});
  }, [fetchAdminNotifications]);

  const latest = useMemo(() => notifications.slice(0, 15), [notifications]);

  const onMarkRead = async (id, read) => {
    if (read) return;
    await markAdminNotificationRead(id);
  };

  return (
    <div className="w-full bg-white p-4 shadow border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="relative rounded-full p-2.5 bg-slate-100 hover:bg-slate-200 transition"
            >
              <span className="text-xl">🔔</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-[420px] max-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-50">
                <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Live Notifications</h3>
                  <button
                    onClick={markAllAdminNotificationsRead}
                    className="text-xs px-2 py-1 rounded-md bg-white/15 hover:bg-white/25"
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
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                          item.read ? "opacity-70" : "bg-sky-50/40"
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
                            <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-1 rounded">
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
        </div>
      </div>
    </div>
  );
}
