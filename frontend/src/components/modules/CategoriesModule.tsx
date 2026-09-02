import React, { useState } from 'react';
import { Layers, Plus, Edit3, Trash2, Package, X } from 'lucide-react';
import { Category } from '../../types';

interface CategoriesModuleProps {
  categories: Category[];
  onAddCategory: (cat: Category) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoriesModule: React.FC<CategoriesModuleProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#3B82F6'
  });

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({ name: '', code: '', description: '', color: '#3B82F6' });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCat(c);
    setFormData({ name: c.name, code: c.code, description: c.description, color: c.color });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
      onUpdateCategory({ ...editingCat, ...formData });
    } else {
      onAddCategory({
        id: `cat-${Date.now()}`,
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        color: formData.color,
        iconName: 'Layers',
        totalProducts: 0
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Category Hierarchy</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Organize inventory catalog into logical product taxonomy</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: c.color }}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{c.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400">Code: {c.code}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => onDeleteCategory(c.id)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">{c.description}</p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Catalog Items:</span>
              </span>
              <span className="font-extrabold text-slate-200">{c.totalProducts || 5} Products</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4">{editingCat ? 'Edit Category' : 'Create Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Category Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ELEC"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 text-xs rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-xs font-semibold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
