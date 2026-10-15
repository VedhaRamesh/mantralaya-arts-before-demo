import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import { Layers, Plus, Edit2, CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';

export const CategoryManagementView: React.FC = () => {
  const { categories, addCategory, updateCategory, toggleCategoryStatus, products } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const res = addCategory({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      icon: 'Sparkles',
      isActive: true,
    });

    if (res.success) {
      setShowAddModal(false);
      setName('');
      setDescription('');
    } else {
      setFormError(res.error || 'Failed to add category.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setFormError('');

    const res = updateCategory(editingCategory.id, {
      name: editingCategory.name,
      description: editingCategory.description,
      isActive: editingCategory.isActive,
    });

    if (res.success) {
      setEditingCategory(null);
    } else {
      setFormError(res.error || 'Failed to update category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-cinzel text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#701A1E]" />
            <span>Product Categories Directory</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage starter categories, edit descriptive copy, and activate/deactivate departments.
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
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const itemCount = products.filter((p) => p.category === cat.name).length;

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-3xl border transition bg-white flex flex-col justify-between ${
                cat.isActive ? 'border-stone-200' : 'border-stone-200/60 opacity-60 bg-stone-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#701A1E]" />
                    <h3 className="font-bold text-sm text-stone-900">{cat.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed mb-3">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className={`text-[11px] font-semibold ${cat.isActive ? 'text-emerald-700' : 'text-stone-400'}`}>
                  {cat.isActive ? 'Active Storefront Dept' : 'Inactive'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setFormError('');
                      setEditingCategory({ ...cat });
                    }}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className={`p-1.5 rounded-lg transition ${
                      cat.isActive
                        ? 'text-amber-600 hover:bg-amber-50'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {cat.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel text-base font-bold text-stone-900">Add Category</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Copper Yantras"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for storefront banner..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#701A1E] text-white font-bold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel text-base font-bold text-stone-900">Edit Category</h3>
              <button onClick={() => setEditingCategory(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#701A1E] text-white font-bold"
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
