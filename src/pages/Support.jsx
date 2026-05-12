import React, { useEffect, useState, useContext } from "react";
import { X, Trash2 } from "lucide-react";
import { AppContext } from "../context/AppContextInstance.js";
import Loader from "../components/Loader.jsx";
import Button from "../components/Button.jsx";

export default function Support() {
  const { fetchSupport, updateTicket, notifySuccess, notifyError, deleteTicket, deleteTickets } = useContext(AppContext);

  const [tickets, setTickets] = useState(null);
  const [search, setSearch] = useState("");

  // Modal states
  const [showDetails, setShowDetails] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [status, setStatus] = useState("pending");

  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isBulkDelete, setIsBulkDelete] = useState(false);

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
    try {
      setIsSubmitting(true);
      await updateTicket(selectedTicket._id, { status, adminMessage });
      notifySuccess("Support ticket updated successfully");
      setShowUpdateModal(false);
      setSelectedTicket(null);
      loadTickets();
    } catch (err) {
      notifyError(err.message || "Failed to update support ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedTicket(null);
  };

  /* ---------------- DELETE ---------------- */
  const openDeleteModal = (ticket = null) => {
    if (ticket) {
      setSelectedTicket(ticket);
      setIsBulkDelete(false);
    } else {
      setIsBulkDelete(true);
    }
    setDeletePassword("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletePassword) return;
    try {
      setIsSubmitting(true);
      if (isBulkDelete) {
        await deleteTickets(selectedIds, deletePassword);
        notifySuccess(`${selectedIds.length} tickets deleted successfully`);
        setSelectedIds([]);
      } else {
        await deleteTicket(selectedTicket._id, deletePassword);
        notifySuccess("Support ticket deleted successfully");
      }
      setShowDeleteModal(false);
      setDeletePassword("");
      loadTickets();
    } catch (err) {
      notifyError(err.message || "Failed to delete ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((t) => t._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
      <div className="border border-[#d8e3d4] bg-white shadow-sm">
        <div className="border-b border-[#dfe8db] bg-[#f6faf4] px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2f6942]">
            Support Desk
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#173b23]">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review incoming support requests and send admin responses.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 gap-4">
          <input
            type="text"
            placeholder="Search by name, phone, email, or message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-[#cfd8cb] bg-[#fbfdfb] px-4 py-2.5 text-sm outline-none transition focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
          />

          {selectedIds.length > 0 && (
            <button
              onClick={() => openDeleteModal()}
              className="flex items-center gap-2 border border-[#8f2f2f] bg-[#a33636] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8f2f2f] transition"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden border border-[#d8e3d4] bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-[#f6faf4] text-sm uppercase text-[#385241]">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    filtered.length > 0 && selectedIds.length === filtered.length
                  }
                  className="rounded border-[#cfd8cb] text-[#2f6942] focus:ring-[#2f6942]"
                />
              </th>
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
              <tr key={t._id} className="border-t border-[#edf2ea] hover:bg-[#fafcf9]">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t._id)}
                    onChange={() => toggleSelect(t._id)}
                    className="rounded border-[#cfd8cb] text-[#2f6942] focus:ring-[#2f6942]"
                  />
                </td>
                <td className="p-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.phone}</div>
                  <div className="text-xs text-gray-500">{t.email}</div>
                </td>

                {/* Member Column */}
                <td className="p-3">
                  {t.memberId ? (
                    <span className="px-2 py-1 text-xs bg-[#eaf4e7] text-[#1f5f3b]">
                      Member ({t.memberId})
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-[#eef3f8] text-[#35506f]">
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
                        ? "bg-[#fff3d9] text-[#9a6b00]"
                        : t.status === "in-progress"
                        ? "bg-[#eef3f8] text-[#35506f]"
                        : "bg-[#eaf4e7] text-[#1f5f3b]"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openDetails(t)}
                      className="text-[#2f6942] hover:underline"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openUpdateModal(t)}
                      className="text-[#1f5f3b] hover:underline"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => openDeleteModal(t)}
                      className="text-[#a33636] hover:text-[#8f2f2f] transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[500px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#173b23]">Update Ticket</h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6]"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <label className="block text-sm mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mb-4 w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
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
              className="mb-4 h-28 w-full border border-[#cfd8cb] bg-[#fbfdfb] p-3 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
            ></textarea>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
              >
                Close
              </button>
              <Button
                onClick={confirmUpdate}
                loading={isSubmitting}
                className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2 text-white"
              >
                Update Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------ */}
      {/* DETAILS MODAL */}
      {/* ------------------------------ */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[500px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#173b23]">Ticket Details</h2>
              <button
                onClick={closeDetails}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6]"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

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
              className="mt-5 w-full border border-[#184d30] bg-[#1f5f3b] px-4 py-2 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#173b23]">Confirm Deletion</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6]"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              {isBulkDelete 
                ? `Are you sure you want to permanently delete ${selectedIds.length} support tickets? This action cannot be undone.`
                : "Are you sure you want to permanently delete this support ticket? This action cannot be undone."
              }
            </p>

            <label className="block text-sm font-medium mb-1">Admin Password</label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter admin password"
              className="mb-4 w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#a33636] focus:ring-2 focus:ring-[#f3d4d4]"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
              >
                Cancel
              </button>
              <Button
                onClick={confirmDelete}
                loading={isSubmitting}
                className="border border-[#8f2f2f] bg-[#a33636] px-4 py-2 text-white"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
