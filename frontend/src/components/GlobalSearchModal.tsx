import React, { useState, useEffect } from 'react';
import { Search, X, Package, Truck, Users, FileText, ArrowRight } from 'lucide-react';
import { Product, Supplier, Customer, SalesOrder } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  onSelectItem: (module: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  customers,
  salesOrders,
  onSelectItem
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedProducts = q ? products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.sku.toLowerCase().includes(q) || 
    p.barcode.toLowerCase().includes(q) ||
    p.categoryName.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedSuppliers = q ? suppliers.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.companyName.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedCustomers = q ? customers.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.company.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedSales = q ? salesOrders.filter(s =>
    s.invoiceNo.toLowerCase().includes(q) ||
    s.customerName.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const hasResults = matchedProducts.length > 0 || matchedSuppliers.length > 0 || matchedCustomers.length > 0 || matchedSales.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything (Product name, SKU, Supplier, Invoice #...)"
            className="w-full bg-transparent border-none text-base text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-slate-500 text-sm">
              Type to search across Products, SKUs, Suppliers, Customers, and Invoices...
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-slate-400 text-sm">
              No matching ERP records found for "<span className="text-cyan-400">{query}</span>"
            </div>
          )}

          {/* Products */}
          {matchedProducts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Products ({matchedProducts.length})</span>
              </p>
              <div className="space-y-1">
                {matchedProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectItem('products', p.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-700" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.sku} • Stock: {p.stockQuantity} {p.unit} • ${p.sellingPrice}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suppliers */}
          {matchedSuppliers.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Suppliers</span>
              </p>
              <div className="space-y-1">
                {matchedSuppliers.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onSelectItem('suppliers', s.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.companyName} • {s.city}, {s.country}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {matchedCustomers.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customers</span>
              </p>
              <div className="space-y-1">
                {matchedCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { onSelectItem('customers', c.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.company} • Type: {c.type}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {matchedSales.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Sales Invoices</span>
              </p>
              <div className="space-y-1">
                {matchedSales.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onSelectItem('sales', s.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">{s.invoiceNo} - {s.customerName}</p>
                      <p className="text-[10px] text-slate-400">${s.grandTotal.toLocaleString()} • Status: {s.paymentStatus}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
