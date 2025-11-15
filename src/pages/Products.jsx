import React, { useEffect, useState, useContext } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import { AppContext } from "../context/AppContext.jsx";
import Loader from "../components/Loader.jsx";

export default function Products() {
  const { productsLoading, fetchProducts, deleteProduct, createProduct, updateProduct } = useContext(AppContext);

  const [listProducts, setListProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    totalUnits: 0,
    reservedUnits: 0,
    basePrice: 0,
    memberPrice: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Load products
  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setListProducts(Array.isArray(data) ? data : data.products || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load products");
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [fetchProducts]);

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
      await createProduct(newProduct);
      setNewProduct({ name: "", totalUnits: 0, reservedUnits: 0, basePrice: 0, memberPrice: 0 });
      load();
    } catch (err) {
      setError(err.message || "Failed to create product");
    }
  };

  if (loading || productsLoading) return <Loader />;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
      </div>

      {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6">{error}</div>}

      {/* CREATE NEW PRODUCT */}
      <div className="mb-6 p-4 bg-white shadow rounded-lg flex space-x-4">
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Total Units"
          value={newProduct.totalUnits}
          onChange={(e) => setNewProduct({ ...newProduct, totalUnits: +e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Reserved Units"
          value={newProduct.reservedUnits}
          onChange={(e) => setNewProduct({ ...newProduct, reservedUnits: +e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Base Price"
          value={newProduct.basePrice}
          onChange={(e) => setNewProduct({ ...newProduct, basePrice: +e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Member Price"
          value={newProduct.memberPrice}
          onChange={(e) => setNewProduct({ ...newProduct, memberPrice: +e.target.value })}
          className="border p-2 rounded"
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
        >
          Add Product
        </button>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Total Units</th>
              <th className="p-4 font-semibold">Reserved Units</th>
              <th className="p-4 font-semibold">Base Price</th>
              <th className="p-4 font-semibold">Member Price</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listProducts.length > 0 ? (
              listProducts.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50 transition">
                  {editingId === p._id ? (
                    <>
                      <td className="p-4">
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="border p-2 rounded w-full"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={editValues.totalUnits}
                          onChange={(e) => setEditValues({ ...editValues, totalUnits: +e.target.value })}
                          className="border p-2 rounded w-full"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={editValues.reservedUnits}
                          onChange={(e) => setEditValues({ ...editValues, reservedUnits: +e.target.value })}
                          className="border p-2 rounded w-full"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={editValues.basePrice}
                          onChange={(e) => setEditValues({ ...editValues, basePrice: +e.target.value })}
                          className="border p-2 rounded w-full"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={editValues.memberPrice}
                          onChange={(e) => setEditValues({ ...editValues, memberPrice: +e.target.value })}
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
                      <td className="p-4">{p.name}</td>
                      <td className="p-4">{p.totalUnits}</td>
                      <td className="p-4">{p.reservedUnits}</td>
                      <td className="p-4">${p.basePrice.toLocaleString()}</td>
                      <td className="p-4">{p.memberPrice ? `$${p.memberPrice.toLocaleString()}` : "-"}</td>
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
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
