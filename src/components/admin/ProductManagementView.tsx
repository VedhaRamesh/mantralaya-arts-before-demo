import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductStatus } from '../../types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Image,
} from 'lucide-react';
import { PaginationControls } from '../common/PaginationControls';

export const ProductManagementView: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Pagination State (Defaults to 20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Pooja Essentials');
  const [price, setPrice] = useState<number>(500);
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [formError, setFormError] = useState('');

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (price <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }
    if (stockQuantity < 0) {
      setFormError('Stock quantity cannot be negative.');
      return;
    }

    const res = addProduct({
      name,
      category,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      description,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1609137144822-2613b5220c4a?auto=format&fit=crop&w=600&q=80',
      status: Number(stockQuantity) === 0 ? 'OUT_OF_STOCK' : status,
      material,
      dimensions,
      weight,
    });

    if (res.success) {
      setShowAddModal(false);
      setName('');
      setDescription('');
      setImageUrl('');
      setPrice(500);
      setStockQuantity(20);
    } else {
      setFormError(res.error || 'Failed to create product.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setFormError('');

    if (editingProduct.price <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }
    if (editingProduct.stockQuantity < 0) {
      setFormError('Stock quantity cannot be negative.');
      return;
    }

    const res = updateProduct(editingProduct.id, {
      name: editingProduct.name,
      category: editingProduct.category,
      price: Number(editingProduct.price),
      stockQuantity: Number(editingProduct.stockQuantity),
      description: editingProduct.description,
      imageUrl: editingProduct.imageUrl,
      status: editingProduct.status,
      material: editingProduct.material,
      dimensions: editingProduct.dimensions,
      weight: editingProduct.weight,
    });

    if (res.success) {
      setEditingProduct(null);
    } else {
      setFormError(res.error || 'Failed to update product.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-cinzel text-stone-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#701A1E]" />
            <span>Product Catalog &amp; Inventory</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Create items, adjust stock counts, update ₹ pricing, and manage temple collection statuses.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products by name or description..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-800 focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
        >
          <option value="ALL">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Listing: Dual-Mode (Responsive Cards on Mobile, Table on Desktop) */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        {/* Mobile View: Stacked Inventory Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No products found matching filters.
            </div>
          ) : (
            paginatedProducts.map((p) => {
              const isOutOfStock = p.status === 'OUT_OF_STOCK' || p.stockQuantity <= 0;
              const isLowStock = p.stockQuantity > 0 && p.stockQuantity < 10;

              return (
                <div key={p.id} className="p-4 space-y-3">
                  {/* Top Row: Thumbnail, Name, ID, Category */}
                  <div className="flex items-start gap-3">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23701A1E"/></svg>';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 leading-tight">
                          {p.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 flex-wrap">
                        <span className="font-mono text-[10px] text-stone-400">{p.id}</span>
                        <span>·</span>
                        <span className="font-semibold text-amber-900">{p.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Price, Stock Badge, Status Pill */}
                  <div className="bg-stone-50 p-2.5 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">Unit Price</span>
                      <span className="font-mono font-extrabold text-[#701A1E] text-sm">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">Stock</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs inline-block mt-0.5 ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {p.stockQuantity} {p.stockQuantity === 1 ? 'unit' : 'units'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">Status</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'OUT_OF_STOCK'
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setFormError('');
                        setEditingProduct({ ...p });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                        updateProduct(p.id, { status: newStatus });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                        p.status === 'ACTIVE'
                          ? 'border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100'
                          : 'border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {p.status === 'ACTIVE' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{p.status === 'ACTIVE' ? 'Hide' : 'Show'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"?`)) {
                          deleteProduct(p.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full 6-Column Data Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Product &amp; ID</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Price (₹)</th>
                <th className="p-3.5 text-center">Available Stock</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedProducts.map((p) => {
                const isOutOfStock = p.status === 'OUT_OF_STOCK' || p.stockQuantity <= 0;
                const isLowStock = p.stockQuantity > 0 && p.stockQuantity < 10;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23701A1E"/></svg>';
                          }}
                        />
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1">{p.name}</p>
                          <span className="font-mono text-[10px] text-stone-400">{p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-stone-700 font-medium">{p.category}</td>

                    <td className="p-3.5 text-right font-mono font-bold text-stone-900 text-sm">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`font-mono font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {p.stockQuantity}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'OUT_OF_STOCK'
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setFormError('');
                            setEditingProduct({ ...p });
                          }}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                            updateProduct(p.id, { status: newStatus });
                          }}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            p.status === 'ACTIVE'
                              ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                          }`}
                          title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          {p.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Universal Responsive Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modal: Add Product (Feature 1) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between">
              <h3 className="font-cinzel text-base font-bold text-amber-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Create New Product</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6">
              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ashtalakshmi Brass Diya (Pair)"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Price (₹ INR) *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Available Stock *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Image URL / Cloud Storage Path</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed religious significance, craft methods, and pooja usage..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Material</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. Pure Brass"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. 8 x 4 inches"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Weight</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 1.2 kg"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between">
              <h3 className="font-cinzel text-base font-bold text-amber-100">
                Edit Product: {editingProduct.name}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Price (₹ INR)</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Stock</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={editingProduct.stockQuantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Status</label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as ProductStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={editingProduct.imageUrl}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs resize-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
