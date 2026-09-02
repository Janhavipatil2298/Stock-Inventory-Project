import React from 'react';
import {
  ShieldAlert,
  UserCheck,
  Warehouse as WarehouseIcon,
  Settings,
  ArrowRight,
  Cpu,
  Sparkles,
  CalendarClock
} from 'lucide-react';
import {
  Product,
  SalesOrder,
  Supplier,
  Customer,
  Employee,
  StockMovement,
  Warehouse,
  ERPConfig,
  AIInsightsData,
  LeaveRequest
} from '../../../types';
import { AdminDashboard } from './AdminDashboard';

interface SuperAdminDashboardProps {
  products: Product[];
  salesOrders: SalesOrder[];
  suppliers: Supplier[];
  customers: Customer[];
  employees: Employee[];
  movements: StockMovement[];
  warehouses: Warehouse[];
  aiInsights: AIInsightsData;
  config: ERPConfig;
  onNavigateModule: (module: string) => void;
  onQuickRestock: (product: Product) => void;
  leaveRequests?: LeaveRequest[];
  onLeaveDecision?: (requestId: string, decision: 'Approved' | 'Rejected', note?: string) => void;
  reviewerName?: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  products,
  salesOrders,
  suppliers,
  customers,
  employees,
  movements,
  warehouses,
  aiInsights,
  config,
  onNavigateModule,
  onQuickRestock,
  leaveRequests = [],
  onLeaveDecision,
  reviewerName
}) => {
  const isDark = config.themeMode !== 'light';
  const text = isDark ? 'text-slate-100' : 'text-slate-900';
  const subtext = isDark ? 'text-slate-400' : 'text-slate-500';
  const innerCard = isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200';
  const banner = isDark
    ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/20'
    : 'bg-gradient-to-r from-emerald-50 via-white to-white border-emerald-200';

  const roleCounts = {
    super_admin: employees.filter(e => e.role === 'super_admin').length,
    admin: employees.filter(e => e.role === 'admin').length,
    employee: employees.filter(e => e.role === 'employee').length,
  };
  const activeEmployees = employees.filter(e => e.status === 'Active').length;

  const warehouseStatusCounts = {
    Operational: warehouses.filter(w => w.status === 'Operational').length,
    Full: warehouses.filter(w => w.status === 'Full').length,
    Maintenance: warehouses.filter(w => w.status === 'Maintenance').length,
  };

  const highPriorityRecs = aiInsights.recommendations.filter(r => r.priority === 'High').length;
  const pendingLeaveCount = leaveRequests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Organization Command Center - super_admin exclusive */}
      <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${banner}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <h3 className={`font-bold text-base ${text}`}>Organization Command Center</h3>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Super Admin • Full Access
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className={`p-3 rounded-xl border space-y-1 ${innerCard}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>Super Admins</p>
            <p className="text-xl font-extrabold text-emerald-400">{roleCounts.super_admin}</p>
          </div>
          <div className={`p-3 rounded-xl border space-y-1 ${innerCard}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>Admins</p>
            <p className="text-xl font-extrabold text-blue-400">{roleCounts.admin}</p>
          </div>
          <div className={`p-3 rounded-xl border space-y-1 ${innerCard}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>Employees</p>
            <p className="text-xl font-extrabold text-amber-400">{roleCounts.employee}</p>
          </div>
          <div className={`p-3 rounded-xl border space-y-1 ${innerCard}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>Active Staff</p>
            <p className={`text-xl font-extrabold ${text}`}>{activeEmployees}<span className={`text-xs ${subtext}`}>/{employees.length}</span></p>
          </div>
          <div className={`p-3 rounded-xl border space-y-1 ${innerCard}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>Warehouses Up</p>
            <p className="text-xl font-extrabold text-cyan-400">{warehouseStatusCounts.Operational}<span className={`text-xs ${subtext}`}>/{warehouses.length}</span></p>
          </div>
          <div className={`p-3 rounded-xl border space-y-1 ${innerCard}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>High-Priority AI</p>
            <p className="text-xl font-extrabold text-rose-400">{highPriorityRecs}</p>
          </div>
          <div className={`p-3 rounded-xl border space-y-1 ${innerCard}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtext}`}>Leave Pending</p>
            <p className="text-xl font-extrabold text-fuchsia-400">{pendingLeaveCount}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => onNavigateModule('employees')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manage Employees & Roles</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigateModule('inventory')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <WarehouseIcon className="w-3.5 h-3.5" />
            <span>Warehouse Status</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => document.getElementById('leave-approvals-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Review Leave Requests</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigateModule('ai-insights')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Review AI Recommendations</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigateModule('settings')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>System Configuration</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className={`flex flex-wrap items-center gap-x-6 gap-y-1 pt-2 border-t text-[10px] ${isDark ? 'border-slate-800/60 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
          <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Backend: {config.usePythonBackend ? 'Python Integration Active' : 'Local Mock Engine'}</span>
          <span>Currency: {config.currencyCode}</span>
          <span>Default Tax: {config.defaultTaxRate}%</span>
          <span>Low Stock Threshold: {config.lowStockThresholdDefault}</span>
        </div>
      </div>

      {/* Full operational dashboard below, same as Admin view, with full leave-approval access */}
      <AdminDashboard
        products={products}
        salesOrders={salesOrders}
        suppliers={suppliers}
        customers={customers}
        employees={employees}
        movements={movements}
        aiInsights={aiInsights}
        config={config}
        onNavigateModule={onNavigateModule}
        onQuickRestock={onQuickRestock}
        leaveRequests={leaveRequests}
        onLeaveDecision={onLeaveDecision}
        reviewerName={reviewerName}
      />
    </div>
  );
};
