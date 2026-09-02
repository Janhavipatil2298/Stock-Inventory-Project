import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, DollarSign, Edit3, Trash2, X } from 'lucide-react';
import { Customer, ERPConfig } from '../../types';

interface CustomersModuleProps {
  customers: Customer[];
  config: ERPConfig;
  onAddCustomer: (cust: Customer) => void;
  onUpdateCustomer: (cust: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomersModule: React.FC<CustomersModuleProps> = ({
  customers,
  config,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    type: 'B2B' as Customer['type'],
    address: '',
    city: ''
  });

  const handleOpenAdd = () => {
    setEditingCust(null);
    setFormData({ name: '', company: '', email: '', phone: '', type: 'B2B', address: '', city: 'Austin' });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCust(c);
    setFormData({
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      type: c.type,
      address: c.address,
      city: c.city
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCust) {
      onUpdateCustomer({ ...editingCust, ...formData });
    } else {
      onAddCustomer({
        id: `cust-${Date.now()}`,
        ...formData,
        outstandingBalance: 0,
        totalPurchases: 0,
        createdAt: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Customer Accounts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">B2B client accounts and retail buyers</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold">
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Company / Type</th>
                <th className="p-3.5">Contact Info</th>
                <th className="p-3.5">Total Purchases</th>
                <th className="p-3.5">Outstanding Balance</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-100">{c.name}</td>
                  <td className="p-3.5">
                    <p className="text-slate-200 font-semibold">{c.company}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">{c.type}</span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <p>{c.email}</p>
                    <p className="text-slate-500">{c.phone}</p>
                  </td>
                  <td className="p-3.5 font-bold text-slate-200">{config.currencySymbol}{c.totalPurchases.toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-amber-400">
                    {c.outstandingBalance > 0 ? `${config.currencySymbol}${c.outstandingBalance.toLocaleString()}` : 'Paid Clean'}
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-slate-400 hover:text-amber-400">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteCustomer(c.id)} className="p-1.5 text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4">{editingCust ? 'Edit Customer' : 'Add Customer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Customer Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Company / Studio Name</label>
                <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
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
