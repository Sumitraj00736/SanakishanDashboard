import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContextInstance.js";
import Loader from "../components/Loader.jsx";

export default function Bookings() {
  const { fetchBookings, cancelBooking, verifyPayment, fetchProducts } =
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

  /* ---------------- CANCEL ---------------- */
  const openCancelModal = (b) => {
    setSelectedBooking(b);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) return;

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

    setShowCancelModal(false);
    setSelectedBooking(null);
    setCancelReason("");
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

    await verifyPayment(selectedBooking._id, {
      method: verifyMethod,
      amount: verifyAmount,
    });

    setShowVerifyModal(false);
    loadBookings();
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
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="px-4 py-2 border rounded-lg w-96"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 uppercase text-gray-600">
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
                <tr key={b._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{b.userName}</div>
                    <div className="text-xs text-gray-500">{b.userPhone}</div>
                    <div className="text-xs text-gray-500">{b.userEmail}</div>
                  </td>

                  <td className="p-3 text-center">
                    {b.memberId ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Member
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
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
                      className={`px-2 py-1 rounded-full text-xs ${
                        status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  <td className="p-3 space-x-3">
                    <button
                      onClick={() => openDetails(b)}
                      className="text-blue-600 hover:underline"
                    >
                      Details
                    </button>

                    {!["cancelled", "canceled"].includes(status) && (
                      <button
                        onClick={() => openCancelModal(b)}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}

                    {status === "pending" && (
                      <button
                        onClick={() => openVerifyModal(b)}
                        className="text-green-600 hover:underline"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Cancel Booking</h2>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Reason"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Close
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY MODAL */}
      {showVerifyModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[420px]">
            <h2 className="text-lg font-bold mb-4">Verify Payment</h2>
            <label className="mb-1 block text-sm font-medium">Method</label>
            <select
              value={verifyMethod}
              onChange={(e) => setVerifyMethod(e.target.value)}
              className="mb-4 w-full rounded border p-2"
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
              className="mb-4 w-full rounded border p-2"
              placeholder="Enter amount"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="rounded bg-gray-300 px-4 py-2"
              >
                Close
              </button>
              <button
                onClick={confirmVerify}
                className="rounded bg-green-700 px-4 py-2 text-white"
              >
                Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 w-[500px] rounded-xl">
            <h2 className="text-lg font-bold mb-4">Booking Details</h2>

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
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
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
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
