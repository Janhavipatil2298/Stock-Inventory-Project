import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Plus, 
  User, 
  Warehouse, 
  ShieldCheck, 
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { User as UserType, NotificationItem, ERPConfig } from '../types';

interface HeaderProps {
  user: UserType | null;
  config: ERPConfig;
  notifications: NotificationItem[];
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenQuickAdd: () => void;
  onOpenAIAssistant: () => void;
  activeWarehouse: string;
  setActiveWarehouse: (wh: string) => void;
  warehousesList: string[];
  unreadCount: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  config,
  onOpenSearch,
  onOpenNotifications,
  onOpenQuickAdd,
  onOpenAIAssistant,
  activeWarehouse,
  setActiveWarehouse,
  warehousesList,
  unreadCount,
  onLogout
}) => {
  const [showWhDropdown, setShowWhDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b backdrop-blur-xl bg-slate-900/80 border-slate-800 text-slate-100 flex items-center justify-between px-4 md:px-6">
      {/* Left: Global Search trigger */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:border-cyan-500/50 hover:text-slate-200 transition-all group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
          <span className="text-sm font-normal text-slate-400 truncate">Search products, SKU, suppliers, invoices...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-700/60 rounded border border-slate-600 ml-auto">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Warehouse Selector */}
        <div className="relative">
          <button
            onClick={() => setShowWhDropdown(!showWhDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium transition-colors"
          >
            <Warehouse className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline truncate max-w-[120px]">{activeWarehouse}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showWhDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Warehouse
              </div>
              <button
                onClick={() => { setActiveWarehouse("All Warehouses"); setShowWhDropdown(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-800 flex items-center justify-between ${
                  activeWarehouse === "All Warehouses" ? "text-cyan-400 bg-cyan-500/10" : "text-slate-300"
                }`}
              >
                <span>All Warehouses</span>
                {activeWarehouse === "All Warehouses" && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              {warehousesList.map(wh => (
                <button
                  key={wh}
                  onClick={() => { setActiveWarehouse(wh); setShowWhDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-800 flex items-center justify-between ${
                    activeWarehouse === wh ? "text-cyan-400 bg-cyan-500/10" : "text-slate-300"
                  }`}
                >
                  <span className="truncate">{wh}</span>
                  {activeWarehouse === wh && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAIAssistant}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all shadow-sm"
          title="Open AI Inventory Assistant"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline text-xs font-semibold">AI Copilot</span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20 transition-all"
          title="Add New Product"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Add Product</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
            alt={user?.name || "User"}
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">{user?.name || "Alexander Vance"}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role?.replace('_', ' ') || "Super Admin"}</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 ml-1 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
