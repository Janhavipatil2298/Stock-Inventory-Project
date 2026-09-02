import React, { useState } from 'react';
import { ShoppingCart, Plus, FileText, Printer, CheckCircle2, Clock, Search, X, Trash2 } from 'lucide-react';
import { SalesOrder, Customer, Product, SalesOrderItem, ERPConfig } from '../../types';

interface SalesModuleProps {
  salesOrders: SalesOrder[];
  customers: Customer[];
  products: Product[];
  config: ERPConfig;
  onAddSalesOrder: (order: SalesOrder) => void;
  onUpdateOrderStatus: (orderId: string, status: SalesOrder['paymentStatus']) => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({
  salesOrders,
  customers,
  products,
  config,
  onAddSalesOrder,
  onUpdateOrderStatus
}) => {
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesOrder | null>(null);

  // POS / New Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [lineItems, setLineItems] = useState<SalesOrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Bank Transfer' | 'UPI'>('Bank Transfer');

  // Item selector helpers
  const [activeProdId, setActiveProdId] = useState(products[0]?.id || '');
  const [addQty, setAddQty] = useState(1);

  const handleAddLineItem = () => {
    const prod = products.find(p => p.id === activeProdId);
    if (!prod) return;

    const existingIdx = lineItems.findIndex(i => i.productId === prod.id);
    if (existingIdx !== -1) {
      const updated = [...lineItems];
      updated[existingIdx].quantity += addQty;
      updated[existingIdx].total = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setLineItems(updated);
    } else {
      const itemTotal = addQty * prod.sellingPrice;
      setLineItems([
        ...lineItems,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: addQty,
          unitPrice: prod.sellingPrice,
          gstRate: prod.gst,
          discountRate: prod.discount,
          total: itemTotal
        }
      ]);
    }
  };

  const handleRemoveLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxTotal = subtotal * (config.defaultTaxRate / 100);
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) return;

    const cust = customers.find(c => c.id === selectedCustomerId) || customers[0];
    const { subtotal, taxTotal, grandTotal } = calculateTotals();

    const newOrder: SalesOrder = {
      id: `so-${Date.now()}`,
      invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: cust.id,
      customerName: cust.name,
      items: lineItems,
      subtotal,
      taxTotal,
      discountTotal: 0,
      grandTotal,
      paymentStatus: 'Paid',
      paymentMethod,
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      createdBy: 'Sophia Patel'
    };

    onAddSalesOrder(newOrder);
    setShowPOSModal(false);
    setLineItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-cyan-400" />
            <span>Sales & Invoice Terminal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Point of Sale order creation, invoice generation, and revenue auditing</p>
        </div>
        <button
          onClick={() => setShowPOSModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Sales Invoice (POS)</span>
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold">
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date & Due</th>
                <th className="p-3.5">Line Items</th>
                <th className="p-3.5">Grand Total</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {salesOrders.map(order => {
                const statusBadge = 
                  order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  order.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/30';

                return (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-cyan-400 font-mono">{order.invoiceNo}</td>
                    <td className="p-3.5 font-semibold text-slate-200">{order.customerName}</td>
                    <td className="p-3.5 text-slate-300">
                      <p>{order.createdDate}</p>
                      <p className="text-[10px] text-slate-500">Due: {order.dueDate}</p>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {order.items.length} items ({order.items.map(i => i.productName).join(', ').slice(0, 30)}...)
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-100">{config.currencySymbol}{order.grandTotal.toLocaleString()}</td>
                    <td className="p-3.5 text-slate-400">{order.paymentMethod}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 border border-slate-700"
                      >
                        Print Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS New Sales Invoice Modal */}
      {showPOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowPOSModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              <span>Create New Sales Invoice (POS)</span>
            </h3>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Customer Select */}
              <div>
                <label className="block text-xs font-semibold mb-1">Select Customer Account</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                </select>
              </div>

              {/* Product Add Row */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <p className="text-[10px] font-bold uppercase text-slate-400">Add Line Item</p>
                <div className="flex items-center space-x-2">
                  <select
                    value={activeProdId}
                    onChange={(e) => setActiveProdId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  >
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.sellingPrice}) - Stock: {p.stockQuantity}</option>)}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={addQty}
                    onChange={(e) => setAddQty(Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300">Invoice Items ({lineItems.length})</p>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{item.productName}</p>
                      <p className="text-[10px] text-slate-400">{item.quantity} x ${item.unitPrice} = ${item.total.toFixed(2)}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveLineItem(idx)} className="p-1 text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{config.currencySymbol}{calculateTotals().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax ({config.defaultTaxRate}%):</span>
                  <span>{config.currencySymbol}{calculateTotals().taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-100 pt-1 border-t border-slate-700">
                  <span>Grand Total:</span>
                  <span className="text-cyan-400">{config.currencySymbol}{calculateTotals().grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setShowPOSModal(false)} className="px-4 py-2 bg-slate-800 text-xs rounded-xl">Cancel</button>
                <button type="submit" disabled={lineItems.length === 0} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl">
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl p-8 shadow-2xl relative">
            <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-800">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{config.companyName}</h2>
                  <p className="text-xs text-slate-500">Official Sales Invoice</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base font-black text-cyan-600">{selectedInvoice.invoiceNo}</p>
                  <p className="text-xs text-slate-500">Date: {selectedInvoice.createdDate}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Bill To:</p>
                <p className="font-bold text-sm text-slate-900">{selectedInvoice.customerName}</p>
              </div>

              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-100 text-slate-600 font-bold">
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold">{item.productName}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">${item.unitPrice}</td>
                      <td className="p-2 text-right font-bold">${item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-3 space-y-1 text-xs text-right">
                <p>Subtotal: ${selectedInvoice.subtotal.toFixed(2)}</p>
                <p>Tax: ${selectedInvoice.taxTotal.toFixed(2)}</p>
                <p className="text-base font-extrabold text-slate-900 pt-1">Grand Total: ${selectedInvoice.grandTotal.toFixed(2)}</p>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  <Printer className="w-4 h-4" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
