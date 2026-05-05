import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContextInstance.js";
import Loader from "../components/Loader.jsx";

export default function Bookings() {
  const { fetchBookings, cancelBooking, verifyPayment, fetchProducts, notifySuccess, notifyError } =
    useContext(AppContext);

  const [bookings, setBookings] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // Modal states
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [verifyMethod, setVerifyMethod] = useState("cash");
  const [verifyAmount, setVerifyAmount] = useState("");

  // UTC → Nepal Time
  const toNPT = (date) =>
    new Date(date).toLocaleString("en-US", {
      timeZone: "Asia/Kathmandu",
    });

  /* ---------------- LOAD DATA ---------------- */
  const loadBookings = async () => {
    const b = await fetchBookings();
    setBookings(Array.isArray(b) ? b : b.bookings || []);
  };

  const loadProducts = async () => {
    const p = await fetchProducts();
    setProducts(Array.isArray(p) ? p : p.products || []);
  };

  useEffect(() => {
    loadBookings();
    loadProducts();
    const onBookingEvent = () => loadBookings();
    window.addEventListener("booking:created", onBookingEvent);
    window.addEventListener("booking:updated", onBookingEvent);
    return () => {
      window.removeEventListener("booking:created", onBookingEvent);
      window.removeEventListener("booking:updated", onBookingEvent);
    };
  }, []);

  /* ---------------- HELPERS ---------------- */
  const getProductName = (productId) => {
    const p = products.find((x) => x._id === productId);
    return p ? p.name : productId;
  };

  const normalizeStatus = (s) => s?.toLowerCase();

  const getStatusClasses = (status) => {
    if (status === "pending") return "bg-[#fff3d9] text-[#9a6b00]";
    if (status === "confirmed") return "bg-[#eaf4e7] text-[#1f5f3b]";
    if (status === "completed") return "bg-[#e6f0ea] text-[#234a2f]";
    return "bg-[#fbebeb] text-[#8f2f2f]";
  };

  /* ---------------- CANCEL ---------------- */
  const openCancelModal = (b) => {
    setSelectedBooking(b);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) return;

    try {
      await cancelBooking(selectedBooking._id, cancelReason);

      // Optimistic UI update
      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBooking._id
            ? {
                ...b,
                status: "cancelled",
                adminNotes: cancelReason,
              }
            : b,
        ),
      );

      notifySuccess("Booking cancelled successfully");
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason("");
    } catch (err) {
      notifyError(err.message || "Failed to cancel booking");
    }
  };

  /* ---------------- VERIFY ---------------- */
  const openVerifyModal = (b) => {
    setSelectedBooking(b);
    setVerifyMethod("cash");
    setVerifyAmount("");
    setShowVerifyModal(true);
  };

  const confirmVerify = async () => {
    if (!verifyAmount.trim()) return;

    try {
      await verifyPayment(selectedBooking._id, {
        method: verifyMethod,
        amount: verifyAmount,
      });

      notifySuccess("Payment verified successfully");
      setShowVerifyModal(false);
      loadBookings();
    } catch (err) {
      notifyError(err.message || "Failed to verify payment");
    }
  };

  /* ---------------- DETAILS ---------------- */
  const openDetails = (b) => {
    setSelectedBooking(b);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedBooking(null);
  };

  /* ---------------- LOADER ---------------- */
  if (!bookings) return <Loader />;

  /* ---------------- SEARCH ---------------- */
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.userName?.toLowerCase().includes(q) ||
      b.userPhone?.toLowerCase().includes(q) ||
      b.userEmail?.toLowerCase().includes(q) ||
      b.memberId?.toLowerCase().includes(q) ||
      getProductName(b.productId)?.toLowerCase().includes(q)
    );
  });

  /* ---------------- RENDER ---------------- */
  return (
    <>
      <div className="border border-[#d8e3d4] bg-white shadow-sm">
        <div className="border-b border-[#dfe8db] bg-[#f6faf4] px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2f6942]">
            Booking Records
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#173b23]">Bookings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track reservations, verify payments, and review booking activity.
          </p>
        </div>

        <div className="px-6 py-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, member, or product"
            className="w-full max-w-md border border-[#cfd8cb] bg-[#fbfdfb] px-4 py-2.5 text-sm outline-none transition focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden border border-[#d8e3d4] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f6faf4] uppercase text-[#385241]">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3">Member</th>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Pricing</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((b) => {
              const status = normalizeStatus(b.status);

              return (
                <tr key={b._id} className="border-t border-[#edf2ea] hover:bg-[#fafcf9]">
                  <td className="p-3">
                    <div className="font-medium">{b.userName}</div>
                    <div className="text-xs text-gray-500">{b.userPhone}</div>
                    <div className="text-xs text-gray-500">{b.userEmail}</div>
                  </td>

                  <td className="p-3 text-center">
                    {b.memberId ? (
                      <span className="px-2 py-1 text-xs bg-[#eaf4e7] text-[#1f5f3b]">
                        Member
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-[#eef3f8] text-[#35506f]">
                        General
                      </span>
                    )}
                  </td>

                  <td className="p-3">{getProductName(b.productId)}</td>
                  <td className="p-3 text-center">{b.quantity}</td>

                  <td className="p-3 text-xs">
                    <div>Price/hr: {b.pricePerHour}</div>
                    <div>Total: {b.totalRent}</div>
                  </td>

                  <td className="p-3">{toNPT(b.startDateTime)}</td>
                  <td className="p-3">{toNPT(b.endDateTime)}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold ${getStatusClasses(status)}`}
                    >
                      {status}
                    </span>
                  </td>

                  <td className="p-3 space-x-3">
                    <button
                      onClick={() => openDetails(b)}
                      className="text-[#2f6942] hover:underline"
                    >
                      Details
                    </button>

                    {!["cancelled", "canceled"].includes(status) && (
                      <button
                        onClick={() => openCancelModal(b)}
                        className="text-[#a33636] hover:underline"
                      >
                        Cancel
                      </button>
                    )}

                    {status === "pending" && (
                      <button
                        onClick={() => openVerifyModal(b)}
                        className="text-[#1f5f3b] hover:underline"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">No bookings found</div>
        )}
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-[#173b23]">Cancel Booking</h2>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mb-4 w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#a33636] focus:ring-2 focus:ring-[#f3d4d4]"
              placeholder="Reason"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
              >
                Close
              </button>
              <button
                onClick={confirmCancel}
                className="border border-[#8f2f2f] bg-[#a33636] px-4 py-2 text-white"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY MODAL */}
      {showVerifyModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[420px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-[#173b23]">Verify Payment</h2>
            <label className="mb-1 block text-sm font-medium">Method</label>
            <select
              value={verifyMethod}
              onChange={(e) => setVerifyMethod(e.target.value)}
              className="mb-4 w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
              <option value="card">Card</option>
            </select>
            <label className="mb-1 block text-sm font-medium">Amount</label>
            <input
              type="number"
              min="0"
              value={verifyAmount}
              onChange={(e) => setVerifyAmount(e.target.value)}
              className="mb-4 w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
              placeholder="Enter amount"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
              >
                Close
              </button>
              <button
                onClick={confirmVerify}
                className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2 text-white"
              >
                Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[500px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-[#173b23]">Booking Details</h2>

            <div className="text-sm space-y-2">
              <p>
                <b>User:</b> {selectedBooking.userName}
              </p>
              <p>
                <b>Phone:</b> {selectedBooking.userPhone}
              </p>
              <p>
                <b>Email:</b> {selectedBooking.userEmail}
              </p>

              <p>
                <b>Status:</b>{" "}
                <span
                  className={
                    ["cancelled", "canceled"].includes(
                      selectedBooking.status?.toLowerCase(),
                    )
                      ? "text-red-600 font-semibold"
                      : "text-gray-800"
                  }
                >
                  {selectedBooking.status}
                </span>
              </p>

              <p>
                <b>Total:</b> {selectedBooking.totalRent || selectedBooking.totalAmount}
              </p>

              {/* CANCELLATION REASON */}
              {["cancelled", "canceled"].includes(
                selectedBooking.status?.toLowerCase(),
              ) &&
                selectedBooking.adminNotes && (
                  <div className="mt-3 border border-[#e7c6c6] bg-[#fbf0f0] p-3">
                    <p className="text-red-700 font-semibold">
                      Cancellation Reason
                    </p>
                    <p className="text-red-600 text-sm">
                      {selectedBooking.adminNotes}
                    </p>
                  </div>
                )}
            </div>

            <button
              onClick={closeDetails}
              className="mt-4 w-full border border-[#184d30] bg-[#1f5f3b] py-2 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
