import React, { useState } from 'react';
import { ShoppingBag, Plus, Truck, CheckCircle2, Clock, X } from 'lucide-react';
import { PurchaseOrder, Supplier, Product, Warehouse as WarehouseType, ERPConfig } from '../../types';

interface PurchasesModuleProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  warehouses: WarehouseType[];
  config: ERPConfig;
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
  onReceivePurchaseOrder: (poId: string) => void;
}

export const PurchasesModule: React.FC<PurchasesModuleProps> = ({
  purchaseOrders,
  suppliers,
  products,
  warehouses,
  config,
  onAddPurchaseOrder,
  onReceivePurchaseOrder
}) => {
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]?.name || 'Warehouse Alpha');
  const [orderItems, setOrderItems] = useState<{ productId: string; productName: string; quantity: number; unitCost: number; total: number }[]>([]);

  const [activeProdId, setActiveProdId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(10);

  const handleAddItem = () => {
    const p = products.find(prod => prod.id === activeProdId);
    if (!p) return;
    setOrderItems([
      ...orderItems,
      {
        productId: p.id,
        productName: p.name,
        quantity: qty,
        unitCost: p.purchasePrice,
        total: qty * p.purchasePrice
      }
    ]);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return;
    const sup = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
    const totalAmount = orderItems.reduce((sum, i) => sum + i.total, 0);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      items: orderItems,
      totalAmount,
      status: 'Ordered',
      expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      warehouse: selectedWarehouse,
      notes: 'Standard replenishment purchase order'
    };

    onAddPurchaseOrder(newPO);
    setShowPOModal(false);
    setOrderItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <span>Purchase Management & Reorders</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Vendor purchase orders, stock receiving, and cost tracking</p>
        </div>
        <button
          onClick={() => setShowPOModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold">
                <th className="p-3.5">PO Number</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Destination Warehouse</th>
                <th className="p-3.5">Items Ordered</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchaseOrders.map(po => {
                const statusBadge = 
                  po.status === 'Received' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  po.status === 'Ordered' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-slate-800 text-slate-400 border-slate-700';

                return (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-amber-400 font-mono">{po.poNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-200">{po.supplierName}</td>
                    <td className="p-3.5 text-slate-300">{po.warehouse}</td>
                    <td className="p-3.5 text-slate-300">{po.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}</td>
                    <td className="p-3.5 font-extrabold text-slate-100">{config.currencySymbol}{po.totalAmount.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {po.status === 'Ordered' && (
                        <button
                          onClick={() => onReceivePurchaseOrder(po.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
                        >
                          Receive Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button onClick={() => setShowPOModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4">Create New Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Supplier</label>
                <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs">
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Destination Warehouse</label>
                <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs">
                  {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Add Item</p>
                <div className="flex items-center space-x-2">
                  <select value={activeProdId} onChange={(e) => setActiveProdId(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs">
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Cost: ${p.purchasePrice})</option>)}
                  </select>
                  <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-16 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-center" />
                  <button type="button" onClick={handleAddItem} className="px-3 py-2 bg-cyan-600 text-white rounded-xl text-xs font-semibold">Add</button>
                </div>
              </div>

              <div className="space-y-2">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                    <span>{item.productName} ({item.quantity} units)</span>
                    <span className="font-bold text-cyan-400">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowPOModal(false)} className="px-4 py-2 bg-slate-800 text-xs rounded-xl">Cancel</button>
                <button type="submit" disabled={orderItems.length === 0} className="px-5 py-2 bg-cyan-600 disabled:opacity-40 text-white text-xs font-semibold rounded-xl">Issue Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
