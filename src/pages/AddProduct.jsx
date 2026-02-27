import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../layout/AdminLayout.jsx";
import { AppContext } from "../context/AppContextInstance.js";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const { createProduct } = useContext(AppContext);
  const [form, setForm] = useState({
    name: "",
    description: "",
    totalUnits: 1,
    maintenanceUnits: 0,
    basePrice: "",
    memberPrice: "",
    refundableDeposit: 0,
    features: ""
  });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        totalUnits: Number(form.totalUnits),
        maintenanceUnits: Number(form.maintenanceUnits),
        basePrice: Number(form.basePrice),
        memberPrice: form.memberPrice ? Number(form.memberPrice) : null,
        refundableDeposit: Number(form.refundableDeposit),
        features: form.features ? form.features.split(",").map(s => s.trim()) : []
      };
      await createProduct(payload);
      nav("/products");
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-6">Add Product</h1>

      <form className="grid grid-cols-1 gap-4 max-w-xl" onSubmit={handleSubmit}>
        <input className="border p-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="border p-2" placeholder="Base Price" value={form.basePrice} onChange={e=>setForm({...form,basePrice:e.target.value})} />
        <input className="border p-2" placeholder="Member Price (optional)" value={form.memberPrice} onChange={e=>setForm({...form,memberPrice:e.target.value})} />
        <input className="border p-2" placeholder="Total Units" value={form.totalUnits} onChange={e=>setForm({...form,totalUnits:e.target.value})} />
        <input className="border p-2" placeholder="Maintenance Units" value={form.maintenanceUnits} onChange={e=>setForm({...form,maintenanceUnits:e.target.value})} />
        <input className="border p-2" placeholder="Refundable Deposit" value={form.refundableDeposit} onChange={e=>setForm({...form,refundableDeposit:e.target.value})} />
        <textarea className="border p-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <input className="border p-2" placeholder="Features (comma separated)" value={form.features} onChange={e=>setForm({...form,features:e.target.value})} />
        <div>
          <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
