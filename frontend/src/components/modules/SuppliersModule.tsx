import React, { useState } from 'react';
import { Truck, Plus, Star, Phone, Mail, MapPin, Edit3, Trash2, X } from 'lucide-react';
import { Supplier } from '../../types';

interface SuppliersModuleProps {
  suppliers: Supplier[];
  onAddSupplier: (sup: Supplier) => void;
  onUpdateSupplier: (sup: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

export const SuppliersModule: React.FC<SuppliersModuleProps> = ({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    rating: 5,
    leadTimeDays: 5
  });

  const handleOpenAdd = () => {
    setEditingSup(null);
    setFormData({ name: '', companyName: '', email: '', phone: '', address: '', city: 'San Jose', country: 'USA', rating: 5, leadTimeDays: 5 });
    setShowModal(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSup(s);
    setFormData({
      name: s.name,
      companyName: s.companyName,
      email: s.email,
      phone: s.phone,
      address: s.address,
      city: s.city,
      country: s.country,
      rating: s.rating,
      leadTimeDays: s.leadTimeDays
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSup) {
      onUpdateSupplier({ ...editingSup, ...formData });
    } else {
      onAddSupplier({
        id: `sup-${Date.now()}`,
        ...formData,
        activeOrdersCount: 0,
        status: 'Active'
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Truck className="w-6 h-6 text-amber-400" />
            <span>Supplier Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage global vendor contact details, lead times, and reliability ratings</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-100">{s.name}</h3>
                <p className="text-xs text-slate-400">{s.companyName}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => handleOpenEdit(s)} className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => onDeleteSupplier(s.id)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>{s.email}</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{s.phone}</span>
              </p>
              <p className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{s.address}, {s.city}, {s.country}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{s.rating} Rating</span>
              </div>
              <span className="text-slate-400">Avg Lead Time: <strong className="text-slate-200">{s.leadTimeDays} days</strong></span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4">{editingSup ? 'Edit Supplier' : 'Register Supplier'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Contact Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Company Name</label>
                <input type="text" required value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone</label>
                  <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Address</label>
                <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
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
