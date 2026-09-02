import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Truck, 
  Users, 
  UserCheck, 
  ShoppingCart, 
  ShoppingBag, 
  Warehouse, 
  BrainCircuit, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Moon,
  Sun,
  LogOut,
  Building2
} from 'lucide-react';
import { UserRole, ERPConfig } from '../types';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userRole: UserRole;
  userName: string;
  config: ERPConfig;
  toggleTheme: () => void;
  onLogout: () => void;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  collapsed,
  setCollapsed,
  userRole,
  userName,
  config,
  toggleTheme,
  onLogout,
  lowStockCount
}) => {
  // Employees have a deliberately narrow scope: Dashboard (attendance, stock
  // updates, leave requests) and Warehouses (logging stock updates). Every
  // other module below is gated to Admin / Super Admin via requiredRole.
  const menuGroups = [
    {
      title: "CORE OPERATIONAL",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined, requiredRole: ['super_admin', 'admin'] },
        { id: 'categories', label: 'Categories', icon: Layers, requiredRole: ['super_admin', 'admin'] },
        { id: 'inventory', label: 'Warehouses (Stock Updates)', icon: Warehouse },
      ]
    },
    {
      title: "COMMERCE & SUPPLY",
      items: [
        { id: 'sales', label: 'Sales & POS', icon: ShoppingCart, requiredRole: ['super_admin', 'admin'] },
        { id: 'purchases', label: 'Purchase Orders', icon: ShoppingBag, requiredRole: ['super_admin', 'admin'] },
        { id: 'suppliers', label: 'Suppliers', icon: Truck, requiredRole: ['super_admin', 'admin'] },
        { id: 'customers', label: 'Customers', icon: Users, requiredRole: ['super_admin', 'admin'] },
      ]
    },
    {
      title: "INTELLIGENCE & ADMIN",
      items: [
        { id: 'ai-insights', label: 'AI Insights Hub', icon: BrainCircuit, highlight: true, requiredRole: ['super_admin', 'admin'] },
        { id: 'employees', label: 'Employees & Leave Approvals', icon: UserCheck, requiredRole: ['super_admin', 'admin'] },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, requiredRole: ['super_admin', 'admin'] },
        { id: 'settings', label: 'Settings', icon: Settings, requiredRole: ['super_admin', 'admin'] },
      ]
    }
  ];

  const roleColors: Record<UserRole, { label: string; bg: string; text: string }> = {
    super_admin: { label: 'SUPER ADMIN', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
    admin: { label: 'ADMIN', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' },
    employee: { label: 'EMPLOYEE', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' }
  };

  const currentRoleInfo = roleColors[userRole] || roleColors.employee;

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out flex flex-col border-r backdrop-blur-xl ${
        config.themeMode === 'dark' 
          ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
          : 'bg-white/90 border-slate-200 text-slate-800'
      } ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="font-bold text-base bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                InventoryPro AI
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Enterprise ERP
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge Indicator */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${currentRoleInfo.bg}`}>
            <span className={currentRoleInfo.text}>{currentRoleInfo.label}</span>
            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{userName}</span>
          </div>
        </div>
      )}

      {/* Menu Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              // Permission check
              if (item.requiredRole && !item.requiredRole.includes(userRole)) {
                return null;
              }

              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl transition-all duration-200 font-medium text-sm group relative ${
                    collapsed ? 'justify-center p-3' : 'px-3 py-2.5 space-x-3'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  } ${item.highlight && !isActive ? 'border border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : ''}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />

                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}

                  {item.highlight && !collapsed && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Quick Actions */}
      <div className="p-3 border-t border-slate-800/50 space-y-2">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors ${
            collapsed ? 'justify-center p-3' : 'px-3 py-2 space-x-3 text-sm font-medium'
          }`}
          title="Toggle Light/Dark Theme"
        >
          {config.themeMode === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          {!collapsed && <span>{config.themeMode === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>

        <button
          onClick={onLogout}
          className={`w-full flex items-center rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ${
            collapsed ? 'justify-center p-3' : 'px-3 py-2 space-x-3 text-sm font-medium'
          }`}
          title="Sign Out / Switch User"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};
