import React, { useEffect, useState, useContext } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import { AppContext } from "../context/AppContext.jsx";
import Loader from "../components/Loader.jsx";

export default function Bookings() {
  const { fetchBookings, cancelBooking, verifyPayment } =
    useContext(AppContext);

  const [bookings, setBookings] = useState(null);
  const [search, setSearch] = useState("");

  // Modal States
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [verifyMethod, setVerifyMethod] = useState("cash");
  const [verifyAmount, setVerifyAmount] = useState("");

  // Helper to convert UTC -> Nepal Time
  const toNPT = (date) =>
    new Date(date).toLocaleString("en-US", { timeZone: "Asia/Kathmandu" });

  const load = async () => {
    const b = await fetchBookings();
    console.log("Loaded bookings:", b);
    setBookings(Array.isArray(b) ? b : b.bookings || []);
  };

  console.log("Bookings state:", bookings);

  useEffect(() => {
    load();
  }, []);

  // --- CANCEL PROCESS ---
  const openCancelModal = (b) => {
    setSelectedBooking(b);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) return;

    await cancelBooking(selectedBooking._id, cancelReason);
    setShowCancelModal(false);
    load();
  };

  // --- VERIFY PROCESS ---
  const openVerifyModal = (b) => {
    setSelectedBooking(b);
    setVerifyAmount("");
    setVerifyMethod("cash");
    setShowVerifyModal(true);
  };

  const confirmVerify = async () => {
    if (!verifyAmount.trim()) return;

    await verifyPayment(selectedBooking._id, {
      method: verifyMethod,
      amount: verifyAmount,
    });

    setShowVerifyModal(false);
    load();
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedBooking(null);
  };

  if (!bookings)
    return (
      <>
        <Loader />
      </>
    );

  // SEARCH FILTER
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.userName?.toLowerCase().includes(q) ||
      b.userPhone?.toLowerCase().includes(q) ||
      b.userEmail?.toLowerCase().includes(q) ||
      b.memberId?.toLowerCase().includes(q) ||
      b.productId?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Bookings</h1>

        <input
          type="text"
          placeholder="Search by name, phone, email, memberId, productId..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-96 shadow-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Member</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Pricing</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">End</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {filtered.map((b) => (
              <tr key={b._id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium">{b.userName}</div>
                  <div className="text-xs text-gray-500">{b.userPhone}</div>
                  <div className="text-xs text-gray-500">{b.userEmail}</div>
                </td>

                <td className="p-3">
                  {b.memberId ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Member ({b.memberId})
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      General
                    </span>
                  )}
                </td>

                <td className="p-3">{b.productSnapshot?.name || b.productId}</td>

                <td className="p-3 text-center font-medium">{b.quantity}</td>

                <td className="p-3">
                  <div className="text-xs">
                    <span className="text-gray-500">Price/unit:</span>{" "}
                    <b>{b.pricePerHour || b.productSnapshot?.pricePerHour}</b>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Total:</span>{" "}
                    <b>{b.totalRent}</b>
                  </div>
                </td>

                <td className="p-3">{toNPT(b.startDateTime)}</td>
                <td className="p-3">{toNPT(b.endDateTime)}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      b.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : b.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="p-3 space-x-3">
                  <button
                    onClick={() => openDetails(b)}
                    className="text-blue-600 hover:underline"
                  >
                    Details
                  </button>

                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => openCancelModal(b)}
                      className="text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}

                  {b.status === "pending" && (
                    <button
                      onClick={() => openVerifyModal(b)}
                      className="text-green-600 hover:underline"
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No bookings found
          </div>
        )}
      </div>

      {/* ------------------------------ */}
      {/* CANCEL MODAL */}
      {/* ------------------------------ */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 w-[400px] rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Cancel Booking</h2>

            <textarea
              placeholder="Enter cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border p-3 rounded-lg h-28"
            ></textarea>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------ */}
      {/* VERIFY PAYMENT MODAL */}
      {/* ------------------------------ */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 w-[400px] rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Verify Payment</h2>

            <label className="block text-sm mb-2">Payment Method</label>
            <select
              value={verifyMethod}
              onChange={(e) => setVerifyMethod(e.target.value)}
              className="w-full border p-2 rounded-lg mb-4"
            >
              <option value="cash">Cash</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
            </select>

            <label className="block text-sm mb-2">Amount Received</label>
            <input
              type="number"
              value={verifyAmount}
              onChange={(e) => setVerifyAmount(e.target.value)}
              className="w-full border p-2 rounded-lg mb-4"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={confirmVerify}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------ */}
      {/* DETAILS MODAL */}
      {/* ------------------------------ */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Booking Details</h2>

            <div className="space-y-2 text-sm">
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
                <b>Product:</b>{" "}
                {selectedBooking.productSnapshot?.name ||
                  selectedBooking.productId}
              </p>

              <p>
                <b>Quantity:</b> {selectedBooking.quantity}
              </p>

              <p>
                <b>Start:</b> {toNPT(selectedBooking.startDateTime)}
              </p>

              <p>
                <b>End:</b> {toNPT(selectedBooking.endDateTime)}
              </p>

              <p>
                <b>Status:</b> {selectedBooking.status}
              </p>

              <p>
                <b>Total Amount:</b> {selectedBooking.totalAmount}
              </p>

              {/* PAYMENT INFO */}
              {selectedBooking.payment && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-green-700">
                    Payment Verified
                  </p>
                  <p>Method: {selectedBooking.payment.method}</p>
                  <p>Amount: {selectedBooking.payment.amount}</p>
                </div>
              )}

              {/* CANCELLATION INFO */}
              {selectedBooking.adminNotes && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="font-semibold text-red-700">Cancellation</p>
                  <p>{selectedBooking.adminNotes}</p>
                </div>
              )}
            </div>

            <button
              onClick={closeDetails}
              className="mt-5 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
