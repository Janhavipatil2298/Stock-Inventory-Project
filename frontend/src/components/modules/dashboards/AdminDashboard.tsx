import React, { useState } from 'react';
import {
  Package,
  DollarSign,
  AlertTriangle,
  Truck,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ArrowUpRight,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Product, SalesOrder, Supplier, Customer, Employee, StockMovement, ERPConfig, AIInsightsData, LeaveRequest } from '../../../types';

interface AdminDashboardProps {
  products: Product[];
  salesOrders: SalesOrder[];
  suppliers: Supplier[];
  customers: Customer[];
  employees?: Employee[];
  movements: StockMovement[];
  aiInsights: AIInsightsData;
  config: ERPConfig;
  onNavigateModule: (module: string) => void;
  onQuickRestock: (product: Product) => void;
  leaveRequests?: LeaveRequest[];
  onLeaveDecision?: (requestId: string, decision: 'Approved' | 'Rejected', note?: string) => void;
  reviewerName?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  salesOrders,
  suppliers,
  customers,
  employees = [],
  movements,
  aiInsights,
  config,
  onNavigateModule,
  onQuickRestock,
  leaveRequests = [],
  onLeaveDecision,
  reviewerName
}) => {
  const isDark = config.themeMode !== 'light';
  const t = {
    card: isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200',
    cardHover: isDark ? 'hover:border-slate-700' : 'hover:border-slate-300',
    text: isDark ? 'text-slate-100' : 'text-slate-900',
    subtext: isDark ? 'text-slate-400' : 'text-slate-500',
    muted: isDark ? 'text-slate-500' : 'text-slate-400',
    inner: isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200',
    inner2: isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100',
    divider: isDark ? 'border-slate-800' : 'border-slate-200',
    banner: isDark
      ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-800'
      : 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200',
    tooltip: { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: isDark ? '#F1F5F9' : '#0F172A' }
  };

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // KPI Calculations
  const totalProducts = products.length;
  const totalSalesRevenue = salesOrders.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalInventoryValuation = products.reduce((sum, p) => sum + (p.stockQuantity * p.purchasePrice), 0);
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minimumStock);
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);
  const pendingLeave = leaveRequests.filter(r => r.status === 'Pending');

  // Sales Trend Chart Data
  const salesChartData = [
    { name: 'Mon', Sales: 2400, Revenue: 3800 },
    { name: 'Tue', Sales: 1398, Revenue: 2200 },
    { name: 'Wed', Sales: 9800, Revenue: 14200 },
    { name: 'Thu', Sales: 3908, Revenue: 6100 },
    { name: 'Fri', Sales: 4800, Revenue: 7900 },
    { name: 'Sat', Sales: 3800, Revenue: 5400 },
    { name: 'Sun', Sales: 6300, Revenue: 9800 },
  ];

  // Stock Distribution Data by Category
  const categoryMap: Record<string, number> = {};
  products.forEach(p => {
    categoryMap[p.categoryName] = (categoryMap[p.categoryName] || 0) + p.stockQuantity;
  });
  const categoryChartData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    quantity: categoryMap[cat]
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  const submitDecision = (id: string, decision: 'Approved' | 'Rejected') => {
    onLeaveDecision?.(id, decision, reviewNote.trim() || undefined);
    setReviewingId(null);
    setReviewNote('');
  };

  return (
    <div className="space-y-6">
      {/* Executive Banner & AI Health Score */}
      <div className={`p-6 rounded-2xl border shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${t.banner}`}>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Supply Chain Engine Active</span>
          </div>
          <h2 className={`text-2xl font-bold ${t.text}`}>Executive Operations Control</h2>
          <p className={`text-xs mt-1 leading-relaxed ${t.subtext}`}>
            Real-time multi-warehouse tracking, predictive demand forecasting, employee leave approvals, and automated stock safety guardrails.
          </p>
        </div>

        {/* Health Score Meter Widget */}
        <div className={`relative z-10 flex items-center space-x-4 p-4 rounded-xl border ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-100 border-slate-200'}`}>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" className={isDark ? 'text-slate-700' : 'text-slate-300'} fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="6"
                className="text-cyan-400"
                fill="transparent"
                strokeDasharray="163"
                strokeDashoffset={163 - (163 * aiInsights.inventoryHealthScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute font-bold text-sm ${t.text}`}>{aiInsights.inventoryHealthScore}%</span>
          </div>
          <div>
            <p className={`text-xs font-bold ${t.text}`}>Inventory Health Index</p>
            <p className={`text-[11px] mt-0.5 ${t.subtext}`}>
              {aiInsights.inventoryHealthScore > 80 ? 'Optimal stock equilibrium' : 'Action needed for low stock'}
            </p>
            <button
              onClick={() => onNavigateModule('ai-insights')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 mt-1 flex items-center space-x-1"
            >
              <span>View AI Health Report</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        <div className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${t.card} ${t.cardHover}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${t.subtext}`}>Total SKU Items</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${t.text}`}>{totalProducts}</span>
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>Total cataloged items</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${t.card} ${t.cardHover}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${t.subtext}`}>Total Sales</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${t.text}`}>{config.currencySymbol}{totalSalesRevenue.toLocaleString()}</span>
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>Year to date revenue</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${t.card} ${t.cardHover}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${t.subtext}`}>Inventory Value</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${t.text}`}>{config.currencySymbol}{totalInventoryValuation.toLocaleString()}</span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>At purchase cost basis</p>
        </div>

        <div
          onClick={() => onNavigateModule('products')}
          className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 cursor-pointer group ${isDark ? 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/60' : 'bg-white border-amber-300 hover:border-amber-500'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-400">{lowStockProducts.length}</span>
            {outOfStockProducts.length > 0 && (
              <span className="text-[10px] font-semibold text-rose-400">({outOfStockProducts.length} Out)</span>
            )}
          </div>
          <p className={`text-[10px] ${t.subtext}`}>Click to review & restock</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${t.card} ${t.cardHover}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${t.subtext}`}>Suppliers</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${t.text}`}>{suppliers.length}</span>
            <span className={`text-[10px] font-semibold ${t.subtext}`}>98% Lead Score</span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>Global vendor partners</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${t.card} ${t.cardHover}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${t.subtext}`}>B2B Customers</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${t.text}`}>{customers.length}</span>
            <span className="text-[10px] font-semibold text-emerald-400">Active</span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>Enterprise accounts</p>
        </div>

        <div
          onClick={() => pendingLeave.length > 0 && document.getElementById('leave-approvals-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${pendingLeave.length > 0 ? 'cursor-pointer group' : ''} ${isDark ? 'bg-slate-900/90 border-fuchsia-500/30 hover:border-fuchsia-500/60' : 'bg-white border-fuchsia-300 hover:border-fuchsia-500'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-400">Leave Approvals</span>
            <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 group-hover:scale-110 transition-transform">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-fuchsia-400">{pendingLeave.length}</span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>Pending employee requests</p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Trend (2 cols) */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${t.text}`}>Sales & Revenue Timeline</h3>
              <p className={`text-xs ${t.subtext}`}>Weekly order velocity and gross income trends</p>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              This Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={12} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={12} />
                <Tooltip contentStyle={t.tooltip} />
                <Area type="monotone" dataKey="Revenue" stroke="#06B6D4" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="Sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Stock Distribution Pie */}
        <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
          <div>
            <h3 className={`font-bold text-base ${t.text}`}>Stock by Category</h3>
            <p className={`text-xs ${t.subtext}`}>Inventory quantity distribution across categories</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="quantity"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={t.tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leave Approvals Panel */}
      <div id="leave-approvals-panel" className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarClock className="w-5 h-5 text-fuchsia-400" />
            <h3 className={`font-bold text-base ${t.text}`}>Employee Leave Approvals</h3>
            {pendingLeave.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30">
                {pendingLeave.length} Pending
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateModule('employees')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>Manage Employees</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[26rem] overflow-y-auto">
          {pendingLeave.length === 0 ? (
            <div className={`py-8 text-center text-xs flex flex-col items-center space-y-2 ${t.muted}`}>
              <Inbox className="w-6 h-6" />
              <span>No pending leave requests right now.</span>
            </div>
          ) : (
            pendingLeave.map(req => (
              <div key={req.id} className={`p-3.5 rounded-xl border space-y-3 ${t.inner}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img src={req.employeeAvatar} alt={req.employeeName} className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${t.text}`}>{req.employeeName}</p>
                      <p className={`text-[10px] ${t.subtext}`}>{req.department}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                    {req.leaveType}
                  </span>
                </div>

                <div className={`text-[11px] space-y-1 ${t.subtext}`}>
                  <p><span className="font-semibold">Dates:</span> {req.startDate} → {req.endDate}</p>
                  <p><span className="font-semibold">Reason:</span> {req.reason}</p>
                  <p className={t.muted}>Applied {req.appliedOn}</p>
                </div>

                {reviewingId === req.id ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Optional note to employee..."
                      className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${isDark ? 'bg-slate-900/80 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => submitDecision(req.id, 'Approved')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 text-xs font-semibold transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Approve
                      </button>
                      <button
                        onClick={() => submitDecision(req.id, 'Rejected')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 text-xs font-semibold transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Confirm Reject
                      </button>
                      <button
                        onClick={() => { setReviewingId(null); setReviewNote(''); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isDark ? 'text-slate-400 border-slate-700 hover:bg-slate-800' : 'text-slate-500 border-slate-300 hover:bg-slate-100'}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setReviewingId(req.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 text-xs font-semibold transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setReviewingId(req.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 text-xs font-semibold transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Section: Low Stock Stream & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock & Expiry Alerts Stream */}
        <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className={`font-bold text-base ${t.text}`}>Low Stock & Reorder Feed</h3>
            </div>
            <button
              onClick={() => onNavigateModule('products')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Manage Products
            </button>
          </div>

          <div className="space-y-2.5">
            {lowStockProducts.length === 0 ? (
              <div className={`py-8 text-center text-xs ${t.muted}`}>
                All inventory items are currently above minimum safety stock threshold.
              </div>
            ) : (
              lowStockProducts.map(p => (
                <div key={p.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${t.inner}`}>
                  <div className="flex items-center space-x-3 min-w-0">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${t.text}`}>{p.name}</p>
                      <p className={`text-[10px] ${t.subtext}`}>
                        Stock: <span className="text-amber-400 font-bold">{p.stockQuantity} {p.unit}</span> (Min: {p.minimumStock}) • {p.warehouse}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickRestock(p)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shrink-0 transition-all"
                  >
                    1-Click PO
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit & Stock Movements Log */}
        <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className={`font-bold text-base ${t.text}`}>Recent Inventory Audit Log</h3>
            </div>
            <button
              onClick={() => onNavigateModule('inventory')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View Warehouse Logs
            </button>
          </div>

          <div className="space-y-2.5">
            {movements.slice(0, 4).map(mov => (
              <div key={mov.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${t.inner2}`}>
                <div>
                  <p className={`font-semibold ${t.text}`}>{mov.productName}</p>
                  <p className={`text-[10px] ${t.subtext}`}>
                    {mov.type}: <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{mov.quantity} units</span> • By {mov.performedBy}
                  </p>
                </div>
                <span className={`text-[10px] ${t.muted}`}>{mov.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
