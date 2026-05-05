import React, { useEffect, useState, useContext } from "react";
import { X } from "lucide-react";
import { AppContext } from "../context/AppContextInstance.js";
import Loader from "../components/Loader.jsx";

export default function Products() {
  const {
    productsLoading,
    fetchProducts,
    fetchCategories,
    deleteProduct,
    createProduct,
    updateProduct,
    notifySuccess,
    notifyError,
  } = useContext(AppContext);

  const [listProducts, setListProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    totalUnits: 0,
    reservedUnits: 0,
    basePrice: 0,
    memberPrice: 0,
    images: [],
    categoryId: "", // <-- API expects categoryId
  });

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const getImageSources = (images) => {
    if (!Array.isArray(images)) return [];

    return images
      .map((image) => {
        if (typeof image === "string") return image;
        if (image?.url) return image.url;
        if (image?.secure_url) return image.secure_url;
        if (image?.path) return image.path;
        return null;
      })
      .filter(Boolean);
  };

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      const products = Array.isArray(data) ? data : data.products || [];
      setListProducts(products);
      setFilteredProducts(products);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load products");
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      const cats = Array.isArray(data) ? data : data.categories || [];
      setCategories(cats);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [fetchProducts, fetchCategories]);

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = listProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.productId?.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, listProducts]);

  // Delete product
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      notifySuccess("Product deleted successfully");
      loadProducts();
    } catch (err) {
      setError(err.message || "Failed to delete product");
      notifyError(err.message || "Failed to delete product");
    }
  };

  // Start editing
  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditValues({
      name: product.name,
      description: product.description || "",
      totalUnits: product.totalUnits,
      reservedUnits: product.reservedUnits || 0,
      basePrice: product.basePrice,
      memberPrice: product.memberPrice || 0,
      categoryId: product.categoryId || "", // <-- edit uses categoryId
      images: [],
      currentImages: getImageSources(product.images),
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setEditValues({});
  };

  // Save edited product
  const handleUpdate = async (id) => {
    if (!editValues.categoryId) {
      notifyError("Category is required");
      return;
    }
    try {
      const hasNewImages = Array.isArray(editValues.images) && editValues.images.length > 0;
      const payload = hasNewImages ? new FormData() : { ...editValues };

      if (hasNewImages) {
        payload.append("name", editValues.name);
        payload.append("description", editValues.description || "");
        payload.append("totalUnits", editValues.totalUnits);
        payload.append("reservedUnits", editValues.reservedUnits);
        payload.append("basePrice", editValues.basePrice);
        payload.append("memberPrice", editValues.memberPrice || 0);
        payload.append("categoryId", editValues.categoryId);
        editValues.images.forEach((file) => {
          payload.append("images", file);
        });
      } else {
        delete payload.images;
        delete payload.currentImages;
      }

      await updateProduct(id, payload);
      notifySuccess("Product updated successfully");
      handleCloseEditModal();
      loadProducts();
    } catch (err) {
      setError(err.message || "Failed to update product");
      notifyError(err.message || "Failed to update product");
    }
  };

  // Create new product
  const handleCreate = async () => {
    if (!newProduct.name.trim() || !newProduct.categoryId) {
      notifyError("Product name and category are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("totalUnits", newProduct.totalUnits);
      formData.append("reservedUnits", newProduct.reservedUnits);
      formData.append("basePrice", newProduct.basePrice);
      formData.append("memberPrice", newProduct.memberPrice || 0);
      formData.append("categoryId", newProduct.categoryId); // <-- send ID
      formData.append("isActive", newProduct.isActive ?? true);

      if (newProduct.images && newProduct.images.length > 0) {
        newProduct.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      await createProduct(formData);
      notifySuccess("Product added successfully");

      // reset form
      setNewProduct({
        name: "",
        description: "",
        totalUnits: 0,
        reservedUnits: 0,
        basePrice: 0,
        memberPrice: 0,
        images: [],
        categoryId: "",
      });
      setShowAddModal(false);
      loadProducts();
    } catch (err) {
      setError(err.message || "Failed to create product");
      notifyError(err.message || "Failed to create product");
    }
  };

  if (loading || productsLoading) return <Loader />;

  return (
    <>
      <div className="border border-[#d8e3d4] bg-white shadow-sm">
        <div className="border-b border-[#dfe8db] bg-[#f6faf4] px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2f6942]">
            Product Management
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#173b23]">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage products, categories, pricing, quantities, and image updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <input
            type="text"
            placeholder="Search by product name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md border border-[#cfd8cb] bg-[#fbfdfb] px-4 py-2.5 text-sm outline-none transition focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#184d30]"
          >
            Add Product
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
              <th className="p-4 font-semibold">Image</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Total Units</th>
              <th className="p-4 font-semibold">Reserved Units</th>
              <th className="p-4 font-semibold">Base Price</th>
              <th className="p-4 font-semibold">Member Price</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p._id} className="border-t border-[#edf2ea] transition hover:bg-[#fafcf9]">
                  <td className="p-4">
                    {getImageSources(p.images)[0] ? (
                      <img
                        src={getImageSources(p.images)[0]}
                        alt={p.name}
                        className="h-14 w-14 border border-[#d8e3d4] object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center border border-[#d8e3d4] bg-[#f5f7f4] text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-800">{p.name}</td>
                  <td className="p-4 max-w-[250px] truncate">
                    {p.description || "-"}
                  </td>
                  <td className="p-4">
                    {categories.find((cat) => cat._id === p.categoryId)?.name || "-"}
                  </td>
                  <td className="p-4">{p.totalUnits}</td>
                  <td className="p-4">{p.reservedUnits}</td>
                  <td className="p-4">NPR {p.basePrice.toLocaleString()}</td>
                  <td className="p-4">
                    {p.memberPrice ? `NPR ${p.memberPrice.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="font-medium text-[#2f6942] hover:text-[#1f5f3b]"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="font-medium text-[#a33636] hover:text-[#8f2f2f]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------ ADD PRODUCT MODAL ------------------ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-[500px] overflow-y-auto border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#173b23]">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6]"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Name</label>
                <input
                  type="text"
                  placeholder="Enter Product Name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Category</label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, categoryId: e.target.value })
                  }
                  className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Description</label>
                <textarea
                  placeholder="Enter product description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="min-h-[100px] border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Total Units</label>
                <input
                  type="text"
                  placeholder="Enter Total Units (number)"
                  value={newProduct.totalUnits}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setNewProduct({
                        ...newProduct,
                        totalUnits: e.target.value,
                      });
                    }
                  }}
                  className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Reserved Units</label>
                <input
                  type="text"
                  placeholder="Enter Reserved Units (number)"
                  value={newProduct.reservedUnits}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setNewProduct({
                        ...newProduct,
                        reservedUnits: e.target.value,
                      });
                    }
                  }}
                  className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Base Price</label>
                <input
                  type="text"
                  placeholder="Enter Base Price (number)"
                  value={newProduct.basePrice}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setNewProduct({ ...newProduct, basePrice: e.target.value });
                    }
                  }}
                  className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Member Price</label>
                <input
                  type="text"
                  placeholder="Enter Member Price (number)"
                  value={newProduct.memberPrice}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setNewProduct({ ...newProduct, memberPrice: e.target.value });
                    }
                  }}
                  className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      images: Array.from(e.target.files),
                    });
                  }}
                  className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5"
                />
                {newProduct.images && newProduct.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newProduct.images.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        className="h-20 w-20 border border-[#d8e3d4] object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
              >
                Close
              </button>
              <button
                onClick={handleCreate}
                className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2 text-white"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#d8e3d4] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#173b23]">Edit Product</h2>
              <button
                onClick={handleCloseEditModal}
                className="border border-[#cfd8cb] bg-[#f3f5f2] p-2 text-slate-600 hover:bg-[#e8eee6]"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Name</label>
                <input
                  type="text"
                  value={editValues.name || ""}
                  onChange={(e) =>
                    setEditValues({ ...editValues, name: e.target.value })
                  }
                  className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Category</label>
                <select
                  value={editValues.categoryId || ""}
                  onChange={(e) =>
                    setEditValues({ ...editValues, categoryId: e.target.value })
                  }
                  className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium text-[#234a2f]">Description</label>
                <textarea
                  value={editValues.description || ""}
                  onChange={(e) =>
                    setEditValues({ ...editValues, description: e.target.value })
                  }
                  className="min-h-[100px] border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-[#234a2f]">Total Units</label>
                  <input
                    type="number"
                    value={editValues.totalUnits ?? 0}
                    onChange={(e) =>
                      setEditValues({ ...editValues, totalUnits: +e.target.value })
                    }
                    className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-[#234a2f]">Reserved Units</label>
                  <input
                    type="number"
                    value={editValues.reservedUnits ?? 0}
                    onChange={(e) =>
                      setEditValues({ ...editValues, reservedUnits: +e.target.value })
                    }
                    className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-[#234a2f]">Base Price</label>
                  <input
                    type="number"
                    value={editValues.basePrice ?? 0}
                    onChange={(e) =>
                      setEditValues({ ...editValues, basePrice: +e.target.value })
                    }
                    className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 font-medium text-[#234a2f]">Member Price</label>
                  <input
                    type="number"
                    value={editValues.memberPrice ?? 0}
                    onChange={(e) =>
                      setEditValues({ ...editValues, memberPrice: +e.target.value })
                    }
                    className="border border-[#cfd8cb] bg-[#fbfdfb] p-2.5 outline-none focus:border-[#2f6942] focus:ring-2 focus:ring-[#d7e6d8]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-[#234a2f]">Current Images</label>
                {Array.isArray(editValues.currentImages) &&
                editValues.currentImages.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {editValues.currentImages.map((src, idx) => (
                      <img
                        key={`${src}-${idx}`}
                        src={src}
                        alt={`current-product-image-${idx}`}
                        className="h-24 w-24 border border-[#d8e3d4] object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No images found for this product.</div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-2 block font-medium text-[#234a2f]">Upload New Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      images: Array.from(e.target.files || []),
                    })
                  }
                  className="w-full border border-[#cfd8cb] bg-[#fbfdfb] p-2.5"
                />
              </div>

              {Array.isArray(editValues.images) && editValues.images.length > 0 && (
                <div>
                  <label className="mb-2 block font-medium text-[#234a2f]">Preview</label>
                  <div className="flex flex-wrap gap-3">
                    {editValues.images.map((file, idx) => (
                      <img
                        key={`${file.name}-${idx}`}
                        src={URL.createObjectURL(file)}
                        alt={`new-product-image-${idx}`}
                        className="h-24 w-24 border border-[#d8e3d4] object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseEditModal}
                className="border border-[#cfd8cb] bg-[#f3f5f2] px-4 py-2 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(editingId)}
                className="border border-[#184d30] bg-[#1f5f3b] px-4 py-2 text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
