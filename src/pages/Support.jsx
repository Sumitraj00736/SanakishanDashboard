import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContextInstance.js";
import Loader from "../components/Loader.jsx";

export default function Support() {
  const { fetchSupport, updateTicket } = useContext(AppContext);

  const [tickets, setTickets] = useState(null);
  const [search, setSearch] = useState("");

  // Modal states
  const [showDetails, setShowDetails] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [status, setStatus] = useState("pending");

  const loadTickets = async () => {
    const t = await fetchSupport();
    setTickets(Array.isArray(t) ? t : t.tickets || []);
  };

  useEffect(() => {
    loadTickets();
    const onCreated = () => loadTickets();
    const onUpdated = () => loadTickets();
    window.addEventListener("support:created", onCreated);
    window.addEventListener("support:updated", onUpdated);
    return () => {
      window.removeEventListener("support:created", onCreated);
      window.removeEventListener("support:updated", onUpdated);
    };
  }, []);

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setAdminMessage(ticket.adminMessage || "");
    setStatus(ticket.status);
    setShowUpdateModal(true);
  };

  const confirmUpdate = async () => {
    if (!selectedTicket) return;
    console.log("clicked!!!!!!!!!!");
    await updateTicket(selectedTicket._id, { status, adminMessage });
    setShowUpdateModal(false);
    setSelectedTicket(null);
    loadTickets();
  };

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedTicket(null);
  };

  if (!tickets) return <Loader />;

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Support Tickets</h1>
        <input
          type="text"
          placeholder="Search by name, phone, email, message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-96 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Member</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Admin Reply</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {filtered.map((t) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.phone}</div>
                  <div className="text-xs text-gray-500">{t.email}</div>
                </td>

                {/* Member Column */}
                <td className="p-3">
                  {t.memberId ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Member ({t.memberId})
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      General
                    </span>
                  )}
                </td>

                <td className="p-3">{t.message}</td>
                <td className="p-3">{t.adminMessage || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      t.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : t.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => openDetails(t)}
                    className="text-blue-600 hover:underline"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => openUpdateModal(t)}
                    className="text-green-600 hover:underline"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">No tickets found</div>
        )}
      </div>

      {/* ------------------------------ */}
      {/* UPDATE MODAL */}
      {/* ------------------------------ */}
      {showUpdateModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Update Ticket</h2>

            <label className="block text-sm mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2 rounded-lg mb-4"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <label className="block text-sm mb-1">Admin Reply</label>
            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              placeholder="Write a reply..."
              className="w-full border p-3 rounded-lg h-28 mb-4"
            ></textarea>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={confirmUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Update Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------ */}
      {/* DETAILS MODAL */}
      {/* ------------------------------ */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Ticket Details</h2>

            <div className="space-y-2 text-sm">
              <p>
                <b>User:</b> {selectedTicket.name}
              </p>
              <p>
                <b>Phone:</b> {selectedTicket.phone}
              </p>
              <p>
                <b>Email:</b> {selectedTicket.email}</p>
              <p>
                <b>Message:</b> {selectedTicket.message}
              </p>
              <p>
                <b>Admin Reply:</b> {selectedTicket.adminMessage || "-"}
              </p>
              <p>
                <b>Status:</b> {selectedTicket.status}
              </p>
              <p>
                <b>Created At:</b>{" "}
                {new Date(selectedTicket.createdAt).toLocaleString()}
              </p>
              <p>
                <b>Member:</b>{" "}
                {selectedTicket.memberId
                  ? `Member (${selectedTicket.memberId})`
                  : "General"}
              </p>
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
