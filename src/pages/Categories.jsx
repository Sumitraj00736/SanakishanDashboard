import React, { useEffect, useState, useContext } from "react";
import { X } from "lucide-react";
import { AppContext } from "../context/AppContextInstance.js";
import Button from "../components/Button.jsx";

export default function Categories() {
  const {
    fetchCategories,
    createCategory,
    deleteCategory,
    updateCategory,
    notifySuccess,
    notifyError,
  } = useContext(AppContext);

  const [listCategories, setListCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState({ _id: "", name: "" });

  const [newCategory, setNewCategory] = useState({ name: "" });

  // Load categories
  const load = async () => {
    try {
      const data = await fetchCategories();
      const categories = Array.isArray(data) ? data : data.categories || [];
      setListCategories(categories);
      setFilteredCategories(categories);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = listCategories.filter((c) =>
      c.name.toLowerCase().includes(term)
    );
    setFilteredCategories(filtered);
  }, [searchTerm, listCategories]);

  // Create new category
  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      notifyError("Category name cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      await createCategory(newCategory);
      notifySuccess("Category added successfully");

      setNewCategory({ name: "" });
      setShowAddModal(false);
      load();
    } catch (err) {
      setError(err.message || "Failed to create category");
      notifyError(err.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEdit = (category) => {
    setEditCategory({ _id: category._id, name: category.name });
    setShowEditModal(true);
  };

  // Update category
  const handleUpdate = async () => {
    if (!editCategory.name.trim()) {
      notifyError("Category name cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateCategory(editCategory._id, { name: editCategory.name });
      notifySuccess("Category updated successfully");
      setShowEditModal(false);
      load();
    } catch (err) {
      setError(err.message || "Failed to update category");
      notifyError(err.message || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(id);
      notifySuccess("Category deleted successfully");
      load();
    } catch (err) {
      setError(err.message || "Failed to delete category");
      notifyError(err.message || "Failed to delete category");
    }
  };

  return (
    <>
      <div className="border border-[#d8e3d4] bg-white shadow-sm">
        <div className="border-b border-[#dfe8db] bg-[#f6faf4] px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2f6942]">
            Category Management
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#173b23]">Categories</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage category names used across the dashboard product listings.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <input
            type="text"
            placeholder="Search category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm border border-[#cfd8cb] bg-[#fbfdfb] px-4 py-2.5 text-sm outline-none transition focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#184d30]"
          >
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 border border-[#dcb7b7] bg-[#fbf0f0] p-4 text-[#8b2f2f]">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden border border-[#d8e3d4] bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-[#f6faf4] text-left text-[#385241]">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-[#edf2ea] transition hover:bg-[#fafcf9]"
                >
                  <td className="p-4 font-medium text-slate-800">{c.name}</td>
                  <td className="p-4 space-x-3">
                    <button
                      onClick={() => openEdit(c)}
                      className="font-medium text-[#2f6942] hover:text-[#1f5f3b]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="font-medium text-[#a33636] hover:text-[#8f2f2f]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No Categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD CATEGORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#173b23]">Add New Category</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6]"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block font-medium text-[#234a2f]">Category Name</label>
                <input
                  type="text"
                  placeholder="Enter Category Name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
              >
                Close
              </button>
              <Button
                onClick={handleCreate}
                loading={isSubmitting}
                className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2 text-white"
              >
                Add Category
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#173b23]">Edit Category</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6]"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block font-medium text-[#234a2f]">Category Name</label>
                <input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
                  className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
              >
                Cancel
              </button>
              <Button
                onClick={handleUpdate}
                loading={isSubmitting}
                className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2 text-white"
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
