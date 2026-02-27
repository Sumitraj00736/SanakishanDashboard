/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContextInstance.js";
import Loader from "../components/Loader.jsx";

export default function Categories() {
  const {
    fetchCategories,
    createCategory,
    deleteCategory,
    updateCategory,
  } = useContext(AppContext);

  const [listCategories, setListCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const data = await fetchCategories();
      const categories = Array.isArray(data) ? data : data.categories || [];
      setListCategories(categories);
      setFilteredCategories(categories);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load categories");
      setLoading(false);
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
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      await createCategory(newCategory);

      setNewCategory({ name: "" });
      setShowAddModal(false);
      load();
    } catch (err) {
      setError(err.message || "Failed to create category");
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
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      await updateCategory(editCategory._id, { name: editCategory.name });
      setShowEditModal(false);
      load();
    } catch (err) {
      setError(err.message || "Failed to update category");
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(id);
      load();
    } catch (err) {
      setError(err.message || "Failed to delete category");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Categories</h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded shadow-sm"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-gray-600">
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
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">{c.name}</td>
                  <td className="p-4 space-x-3">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-[400px] rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 font-medium">Category Name</label>
                <input
                  type="text"
                  placeholder="Enter Category Name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-[400px] rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 font-medium">Category Name</label>
                <input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
