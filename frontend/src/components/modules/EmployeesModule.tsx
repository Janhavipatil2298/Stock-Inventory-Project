import React, { useState } from 'react';
import { UserCheck, Plus, ShieldCheck, Mail, Phone, Lock, Edit3, Trash2, X, Check, Eye } from 'lucide-react';
import { Employee, UserRole } from '../../types';

interface EmployeesModuleProps {
  employees: Employee[];
  currentUserRole: UserRole;
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeesModule: React.FC<EmployeesModuleProps> = ({
  employees,
  currentUserRole,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee' as UserRole,
    department: 'Logistics',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: 'Logistics',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      department: emp.department,
      avatar: emp.avatar
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp) {
      onUpdateEmployee({ ...editingEmp, ...formData });
    } else {
      onAddEmployee({
        id: `emp-${Date.now()}`,
        ...formData,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(false);
  };

  // RBAC Matrix
  const permissionsMatrix = [
    { module: 'View Dashboard & Stock Counts', superAdmin: true, admin: true, employee: true },
    { module: 'Create / Edit Products', superAdmin: true, admin: true, employee: false },
    { module: 'Delete Products & Categories', superAdmin: true, admin: false, employee: false },
    { module: 'Sales POS & Order Dispatch', superAdmin: true, admin: true, employee: true },
    { module: 'Purchase Order Approval', superAdmin: true, admin: true, employee: false },
    { module: 'Inter-Warehouse Stock Transfers', superAdmin: true, admin: true, employee: true },
    { module: 'Employee Management & Role Granting', superAdmin: true, admin: false, employee: false },
    { module: 'System Backup & Python API Settings', superAdmin: true, admin: false, employee: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-blue-400" />
            <span>Staff Roster & Role Security</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage staff accounts and role-based permissions (Super Admin, Admin, Employee)</p>
        </div>
        {currentUserRole === 'super_admin' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {employees.map(emp => {
          const roleBadge = 
            emp.role === 'super_admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
            emp.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
            'bg-amber-500/10 text-amber-400 border-amber-500/30';

          return (
            <div key={emp.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-slate-100 truncate">{emp.name}</h3>
                  <p className="text-[10px] text-slate-400">{emp.department}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${roleBadge}`}>
                    {emp.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <p className="truncate">{emp.email}</p>
                <p className="text-slate-500">{emp.phone}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold text-[10px]">● {emp.status}</span>
                {currentUserRole === 'super_admin' && (
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleOpenEdit(emp)} className="p-1 text-slate-400 hover:text-amber-400">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDeleteEmployee(emp.id)} className="p-1 text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role-Based Access Control (RBAC) Matrix Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-slate-100">Role Permissions Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold">
                <th className="p-3">Functional Capabilities</th>
                <th className="p-3 text-center">Super Admin</th>
                <th className="p-3 text-center">Admin</th>
                <th className="p-3 text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-200">{row.module}</td>
                  <td className="p-3 text-center">
                    {row.superAdmin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="p-3 text-center">
                    {row.admin ? <Check className="w-4 h-4 text-blue-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="p-3 text-center">
                    {row.employee ? <Check className="w-4 h-4 text-amber-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
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
            <h3 className="font-bold text-lg mb-4">{editingEmp ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Role Grant</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100">
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Department</label>
                  <input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
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
