import React, { useEffect, useState, useContext } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import { AppContext } from "../context/AppContext.jsx";
import Loader from "../components/Loader.jsx";

export default function Products() {
  const {
    productsLoading,
    fetchProducts,
    deleteProduct,
    createProduct,
    updateProduct,
  } = useContext(AppContext);

  const [listProducts, setListProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    productId: "",
    name: "",
    totalUnits: 0,
    reservedUnits: 0,
    basePrice: 0,
    memberPrice: 0,
    images: [],
  });

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Load products
  const load = async () => {
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

  useEffect(() => {
    load();
  }, [fetchProducts]);

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
      load();
    } catch (err) {
      setError(err.message || "Failed to delete product");
    }
  };

  // Start editing
  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditValues({
      productId: product._id || "",
      name: product.name,
      totalUnits: product.totalUnits,
      reservedUnits: product.reservedUnits || 0,
      basePrice: product.basePrice,
      memberPrice: product.memberPrice,
    });
  };

  // Save edited product
  const handleUpdate = async (id) => {
    try {
      await updateProduct(id, editValues);
      setEditingId(null);
      setEditValues({});
      load();
    } catch (err) {
      setError(err.message || "Failed to update product");
    }
  };

  // Create new product
  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("totalUnits", newProduct.totalUnits);
      formData.append("reservedUnits", newProduct.reservedUnits);
      formData.append("basePrice", newProduct.basePrice);
      formData.append("memberPrice", newProduct.memberPrice || 0);
      formData.append("maintenanceUnits", newProduct.maintenanceUnits || 0);
      formData.append("refundableDeposit", newProduct.refundableDeposit || 0);
      formData.append("isActive", newProduct.isActive ?? true);
      formData.append("images", newProduct.images || []);

      if (newProduct.images && newProduct.images.length > 0) {
        newProduct.images.forEach((file) => {
          formData.append("images", file);
        });
      }
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }
      console.log("Creating product with data:", {
        name: newProduct.name,
        totalUnits: newProduct.totalUnits,
        reservedUnits: newProduct.reservedUnits,
        basePrice: newProduct.basePrice,
        memberPrice: newProduct.memberPrice || 0,
        images: newProduct.images,
      });
      // call your context API
      await createProduct(formData);

      // reset form
      setNewProduct({
        name: "",
        totalUnits: 0,
        reservedUnits: 0,
        basePrice: 0,
        memberPrice: 0,
        images: [],
      });
      setShowAddModal(false);
      load();
    } catch (err) {
      setError(err.message || "Failed to create product");
    }
  };

  console.log("Rendering Products component");
  if (loading || productsLoading) return <Loader />;

  return (
    <>
      {/* HEADER + SEARCH + ADD BUTTON */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by Product Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded shadow-sm"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="p-4 font-semibold">Product ID</th>
              <th className="p-4 font-semibold">Name</th>
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
                <tr
                  key={p._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {editingId === p._id ? (
                    <>
                      <td className="p-4">
                        <input
                          type="text"
                          value={editValues.productId}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              productId: e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          value={editValues.totalUnits}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              totalUnits: +e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          value={editValues.reservedUnits}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              reservedUnits: +e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          value={editValues.basePrice}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              basePrice: +e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          value={editValues.memberPrice}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              memberPrice: +e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>

                      <td className="p-4 space-x-2">
                        <button
                          onClick={() => handleUpdate(p._id)}
                          className="text-green-600 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 font-medium"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4">{p._id || "-"}</td>
                      <td className="p-4">{p.name}</td>
                      <td className="p-4">{p.totalUnits}</td>
                      <td className="p-4">{p.reservedUnits}</td>
                      <td className="p-4">
                        NPR {p.basePrice.toLocaleString()}
                      </td>
                      <td className="p-4">
                        {p.memberPrice
                          ? `NPR ${p.memberPrice.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="p-4 space-x-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------ ADD PRODUCT MODAL ------------------ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-[500px] rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>

            <div className="grid gap-4">
              {/* Product Name */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Name</label>
                <input
                  type="text"
                  placeholder="Enter Product Name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="border p-2 rounded"
                />
              </div>

              {/* Total Units */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Total Units</label>
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
                  className="border p-2 rounded"
                />
              </div>

              {/* Reserved Units */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Reserved Units</label>
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
                  className="border p-2 rounded"
                />
              </div>

              {/* Base Price */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Base Price</label>
                <input
                  type="text"
                  placeholder="Enter Base Price (number)"
                  value={newProduct.basePrice}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setNewProduct({
                        ...newProduct,
                        basePrice: e.target.value,
                      });
                    }
                  }}
                  className="border p-2 rounded"
                />
              </div>

              {/* Member Price */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Member Price</label>
                <input
                  type="text"
                  placeholder="Enter Member Price (number)"
                  value={newProduct.memberPrice}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setNewProduct({
                        ...newProduct,
                        memberPrice: e.target.value,
                      });
                    }
                  }}
                  className="border p-2 rounded"
                />
              </div>

              {/* Images */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    // Save files directly in state
                    setNewProduct({
                      ...newProduct,
                      images: Array.from(e.target.files),
                    });
                  }}
                  className="border p-2 rounded"
                />

                {newProduct.images && newProduct.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newProduct.images.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)} // temporary preview only
                        alt={`preview-${idx}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
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
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
