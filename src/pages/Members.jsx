import React, { useEffect, useState, useContext } from "react";
import { X } from "lucide-react";
import { AppContext } from "../context/AppContextInstance.js";
import Loader from "../components/Loader.jsx";
import Button from "../components/Button.jsx";

export default function Members() {
  const { fetchMembers, createMember, updateMember, deleteMember, notifySuccess, notifyError } =
    useContext(AppContext);

  const [members, setMembers] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [form, setForm] = useState({
    memberId: "",
    name: "",
    phone: "",
    email: "",
    status: "active",
    validUntil: "",
    discountPercent: 0,
  });

  const getStatusClasses = (status) => {
    if (status === "active") return "bg-[#eaf4e7] text-[#1f5f3b]";
    if (status === "suspended") return "bg-[#fff3d9] text-[#9a6b00]";
    return "bg-[#fbebeb] text-[#8f2f2f]";
  };

  // Load members
  const load = async () => {
    const m = await fetchMembers();
    const list = Array.isArray(m) ? m : m.members || [];
    setMembers(list);
    setFiltered(list);
  };

  useEffect(() => {
    load();
  }, []);

  // ========= SEARCH LOGIC =========
  useEffect(() => {
    if (!members) return;

    const q = search.toLowerCase();

    const result = members.filter((m) =>
      m.memberId?.toLowerCase().includes(q) ||
      m.name?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );

    setFiltered(result);
  }, [search, members]);

  const openCreateModal = () => {
    setEditingMember(null);
    setForm({
      memberId: "",
      name: "",
      phone: "",
      email: "",
      status: "active",
      validUntil: "",
      discountPercent: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setEditingMember(m._id);
    setForm({
      memberId: m.memberId,
      name: m.name,
      phone: m.phone,
      email: m.email,
      status: m.status,
      validUntil: m.validUntil?.slice(0, 10) || "",
      discountPercent: m.discountPercent,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      if (editingMember) {
        await updateMember(editingMember, form);
        notifySuccess("Member updated successfully");
      } else {
        await createMember(form);
        notifySuccess("Member added successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      notifyError(err.message || "Failed to save member");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!members)
    return (
      <>
        <Loader />
      </>
    );

  return (
    <>
      <div className="border border-[#d8e3d4] bg-white shadow-sm">
        <div className="border-b border-[#dfe8db] bg-[#f6faf4] px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2f6942]">
            Member Records
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#173b23]">Members</h1>
          <p className="mt-1 text-sm text-slate-600">
            Search, add, and maintain member details and discount status.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <input
            type="text"
            placeholder="Search by ID, name, phone, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-[#cfd8cb] bg-[#fbfdfb] px-4 py-2.5 text-sm outline-none transition focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
          />

          <button
            onClick={openCreateModal}
            className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#184d30]"
          >
            Add Member
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden border border-[#d8e3d4] bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-[#f6faf4] text-[#385241]">
            <tr>
              <th className="p-3 text-left">Member ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Valid Until</th>
              <th>Discount %</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((m) => (
              <tr key={m._id} className="border-t border-[#edf2ea] hover:bg-[#fafcf9]">
                <td className="p-3">{m.memberId}</td>
                <td>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>
                  <span
                    className={`px-2 py-1 text-xs font-semibold ${getStatusClasses(m.status)}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td>{m.validUntil?.slice(0, 10) || "-"}</td>
                <td>{m.discountPercent}%</td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => openEditModal(m)}
                    className="mr-4 font-semibold text-[#2f6942]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm("Delete this member?")) {
                        try {
                          await deleteMember(m._id);
                          notifySuccess("Member deleted successfully");
                          load();
                        } catch (err) {
                          notifyError(err.message || "Failed to delete member");
                        }
                      }
                    }}
                    className="font-semibold text-[#a33636]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-6 text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ====== MODAL (same as before) ====== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[420px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#173b23]">
                {editingMember ? "Edit Member" : "Add Member"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6]"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {/* form fields same as previous version */}
              <input
                type="text"
                placeholder="Member ID"
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
              />

              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
              />

              <input
                type="text"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="expired">Expired</option>
              </select>

              <input
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm({ ...form, validUntil: e.target.value })
                }
                className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
              />

              <input
                type="number"
                placeholder="Discount Percent"
                value={form.discountPercent}
                onChange={(e) =>
                  setForm({ ...form, discountPercent: e.target.value })
                }
                className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
                >
                  Cancel
                </button>

                <Button
                  onClick={handleSave}
                  loading={isSubmitting}
                  className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
