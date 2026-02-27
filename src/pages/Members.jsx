import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContextInstance.js";
import Loader from "../components/Loader.jsx";

export default function Members() {
  const { fetchMembers, createMember, updateMember, deleteMember } =
    useContext(AppContext);

  const [members, setMembers] = useState(null);
  const [filtered, setFiltered] = useState([]);
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
    if (editingMember) {
      await updateMember(editingMember, form);
    } else {
      await createMember(form);
    }
    setShowModal(false);
    load();
  };

  if (!members)
    return (
      <>
        <Loader />
      </>
    );

  return (
    <>
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-semibold">Members</h1>

        <div className="flex gap-3">
          {/* 🔍 SEARCH BAR */}
          <input
            type="text"
            placeholder="Search by ID, Name, Phone, Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-80 shadow-sm"
          />

          <button
            onClick={openCreateModal}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            + Add Member
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
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
              <tr key={m._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{m.memberId}</td>
                <td>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      m.status === "active"
                        ? "bg-green-600"
                        : m.status === "suspended"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td>{m.validUntil?.slice(0, 10) || "-"}</td>
                <td>{m.discountPercent}%</td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => openEditModal(m)}
                    className="text-blue-600 font-semibold mr-4"
                  >
                    Edit
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm("Delete this member?")) {
                        await deleteMember(m._id);
                        load();
                      }
                    }}
                    className="text-red-600 font-semibold"
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[420px]">
            <h2 className="text-xl font-semibold mb-4">
              {editingMember ? "Edit Member" : "Add Member"}
            </h2>

            <div className="space-y-3">
              {/* form fields same as previous version */}
              <input
                type="text"
                placeholder="Member ID"
                value={form.memberId}
                onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border p-2 rounded"
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
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                placeholder="Discount Percent"
                value={form.discountPercent}
                onChange={(e) =>
                  setForm({ ...form, discountPercent: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
