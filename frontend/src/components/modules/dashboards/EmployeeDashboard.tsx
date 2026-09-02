import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  ScanLine,
  CheckCircle2,
  LogIn,
  LogOut,
  Timer,
  CalendarPlus,
  Bell,
  Hourglass,
  XCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { Product, StockMovement, ERPConfig, LeaveRequest, AttendanceRecord } from '../../../types';

interface EmployeeDashboardProps {
  products: Product[];
  movements: StockMovement[];
  config: ERPConfig;
  currentUserName: string;
  onNavigateModule: (module: string) => void;
  onQuickRestock: (product: Product) => void;
  leaveRequests?: LeaveRequest[];
  attendance?: AttendanceRecord[];
  onSubmitLeaveRequest?: (payload: { leaveType: LeaveRequest['leaveType']; startDate: string; endDate: string; reason: string; }) => void;
  onClockIn?: () => void;
  onClockOut?: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
const todayStr = () => new Date().toISOString().split('T')[0];

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  products,
  movements,
  config,
  currentUserName,
  onNavigateModule,
  onQuickRestock,
  leaveRequests = [],
  attendance = [],
  onSubmitLeaveRequest,
  onClockIn,
  onClockOut
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
    input: isDark ? 'bg-slate-900/80 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400',
    banner: isDark
      ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-800'
      : 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200',
    tooltip: { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: isDark ? '#F1F5F9' : '#0F172A' }
  };

  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Casual Leave');
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [reason, setReason] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minimumStock);
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);

  // Prefer showing this employee's own recent activity; fall back to the general feed
  const myMovements = movements.filter(m => m.performedBy === currentUserName);
  const recentMovements = (myMovements.length > 0 ? myMovements : movements).slice(0, 5);

  const myAttendanceToday = attendance.find(a => a.employeeName === currentUserName && a.date === todayStr());
  const myLeaveRequests = leaveRequests.filter(r => r.employeeName === currentUserName);

  const categoryMap: Record<string, number> = {};
  products.forEach(p => {
    categoryMap[p.categoryName] = (categoryMap[p.categoryName] || 0) + p.stockQuantity;
  });
  const categoryChartData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    quantity: categoryMap[cat]
  }));

  const quickActions = [
    { id: 'inventory', label: 'Log Stock Update', icon: ScanLine, action: () => onNavigateModule('inventory') },
    { id: 'attendance', label: 'Attendance', icon: Timer, action: () => document.getElementById('attendance-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
    { id: 'leave', label: 'Request Leave', icon: CalendarPlus, action: () => document.getElementById('leave-request-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
    { id: 'products', label: 'View Products', icon: Package, action: () => onNavigateModule('products') },
  ];

  const leaveStatusStyle: Record<LeaveRequest['status'], string> = {
    Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setSubmitMsg('Please add a short reason for the leave request.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setSubmitMsg('End date cannot be before the start date.');
      return;
    }
    onSubmitLeaveRequest?.({ leaveType, startDate, endDate, reason: reason.trim() });
    setReason('');
    setSubmitMsg('Leave request submitted. Your admin has been notified.');
    setTimeout(() => setSubmitMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`p-6 rounded-2xl border shadow-2xl relative overflow-hidden ${t.banner}`}>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Operational Workspace</span>
          </div>
          <h2 className={`text-2xl font-bold ${t.text}`}>Welcome back, {currentUserName.split(' ')[0]}</h2>
          <p className={`text-xs mt-1 leading-relaxed ${t.subtext}`}>
            Clock your attendance, log stock updates, and request leave — all from one place.
          </p>
        </div>
      </div>

      {/* KPI Cards - operational only, no revenue/valuation figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${t.card} ${t.cardHover}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${t.subtext}`}>Total SKU Items</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${t.text}`}>{totalProducts}</span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>Total cataloged items</p>
        </div>

        <div
          onClick={() => onNavigateModule('inventory')}
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
          <p className={`text-[10px] ${t.subtext}`}>Click to log a stock update</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${t.card} ${t.cardHover}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${t.subtext}`}>My Recent Movements</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${t.text}`}>{myMovements.length}</span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>Logged by you</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all shadow-xl space-y-2 ${t.card} ${t.cardHover}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${t.subtext}`}>Out of Stock</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${t.text}`}>{outOfStockProducts.length}</span>
          </div>
          <p className={`text-[10px] ${t.muted}`}>Needs immediate reorder</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-5 rounded-2xl border shadow-xl ${t.card}`}>
        <h3 className={`font-bold text-base mb-4 ${t.text}`}>Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center text-center space-y-2 group ${isDark ? 'bg-slate-800/60 border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:border-cyan-500/50 hover:bg-white'}`}
              >
                <Icon className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Attendance + Leave Request */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Panel */}
        <div id="attendance-panel" className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-cyan-400" />
            <h3 className={`font-bold text-base ${t.text}`}>Today's Attendance</h3>
          </div>

          <div className={`p-4 rounded-xl border space-y-3 ${t.inner}`}>
            <div className="flex items-center justify-between text-xs">
              <span className={t.subtext}>Clock In</span>
              <span className={`font-bold ${myAttendanceToday?.clockIn ? 'text-emerald-400' : t.muted}`}>
                {myAttendanceToday?.clockIn || 'Not clocked in yet'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={t.subtext}>Clock Out</span>
              <span className={`font-bold ${myAttendanceToday?.clockOut ? 'text-rose-400' : t.muted}`}>
                {myAttendanceToday?.clockOut || '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onClockIn}
                disabled={!!myAttendanceToday?.clockIn}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-400 border border-emerald-500/40 text-xs font-semibold transition-all"
              >
                <LogIn className="w-3.5 h-3.5" /> Clock In
              </button>
              <button
                onClick={onClockOut}
                disabled={!myAttendanceToday?.clockIn || !!myAttendanceToday?.clockOut}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-rose-400 border border-rose-500/40 text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" /> Clock Out
              </button>
            </div>
          </div>

          <p className={`text-[10px] flex items-center gap-1.5 ${t.muted}`}>
            <Bell className="w-3 h-3" /> Notifications for approvals appear in the bell icon above.
          </p>
        </div>

        {/* Leave Request Panel */}
        <div id="leave-request-panel" className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
          <div className="flex items-center space-x-2">
            <CalendarPlus className="w-5 h-5 text-fuchsia-400" />
            <h3 className={`font-bold text-base ${t.text}`}>Request Leave</h3>
          </div>

          <form onSubmit={handleLeaveSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-wide mb-1 ${t.subtext}`}>Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${t.input}`}
                >
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Vacation</option>
                  <option>Emergency</option>
                  <option>Other</option>
                </select>
              </div>
              <div />
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-wide mb-1 ${t.subtext}`}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${t.input}`}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-wide mb-1 ${t.subtext}`}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 ${t.input}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-[10px] font-semibold uppercase tracking-wide mb-1 ${t.subtext}`}>Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Briefly explain the reason for leave..."
                className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:border-cyan-500 resize-none ${t.input}`}
              />
            </div>
            {submitMsg && (
              <p className={`text-[11px] ${submitMsg.startsWith('Leave request submitted') ? 'text-emerald-400' : 'text-rose-400'}`}>{submitMsg}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-fuchsia-600/20 transition-all"
            >
              Submit Leave Request
            </button>
          </form>

          {myLeaveRequests.length > 0 && (
            <div className="pt-2 space-y-2 max-h-40 overflow-y-auto">
              <p className={`text-[10px] font-bold uppercase tracking-wide ${t.muted}`}>My Requests</p>
              {myLeaveRequests.map(req => (
                <div key={req.id} className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${t.inner2}`}>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-semibold truncate ${t.text}`}>{req.leaveType} • {req.startDate} → {req.endDate}</p>
                    {req.reviewNote && <p className={`text-[10px] italic ${t.subtext}`}>"{req.reviewNote}"</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 ${leaveStatusStyle[req.status]}`}>
                    {req.status === 'Pending' && <Hourglass className="w-2.5 h-2.5" />}
                    {req.status === 'Approved' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {req.status === 'Rejected' && <XCircle className="w-2.5 h-2.5" />}
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock & Reorder Feed */}
        <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className={`font-bold text-base ${t.text}`}>Low Stock & Reorder Feed</h3>
            </div>
            <button
              onClick={() => onNavigateModule('inventory')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Log Stock Update
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
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

        {/* Stock by Category (operational, non-financial) */}
        <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
          <div>
            <h3 className={`font-bold text-base ${t.text}`}>Stock by Category</h3>
            <p className={`text-xs ${t.subtext}`}>Inventory quantity distribution across categories</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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

      {/* My Recent Activity */}
      <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${t.card}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className={`font-bold text-base ${t.text}`}>
              {myMovements.length > 0 ? 'My Recent Activity' : 'Recent Inventory Activity'}
            </h3>
          </div>
          <button
            onClick={() => onNavigateModule('inventory')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View Warehouse Logs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentMovements.length === 0 ? (
            <div className={`py-6 text-center text-xs ${t.muted}`}>No recent activity yet.</div>
          ) : (
            recentMovements.map(mov => (
              <div key={mov.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${t.inner2}`}>
                <div>
                  <p className={`font-semibold ${t.text}`}>{mov.productName}</p>
                  <p className={`text-[10px] ${t.subtext}`}>
                    {mov.type}: <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{mov.quantity} units</span> • By {mov.performedBy}
                  </p>
                </div>
                <span className={`text-[10px] ${t.muted}`}>{mov.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
