import React, { useState } from 'react';
import { Warehouse as WarehouseIcon, ArrowLeftRight, Clock, Plus, Shield, MapPin, X } from 'lucide-react';
import { Warehouse as WarehouseType, StockMovement, Product } from '../../types';

interface InventoryWarehouseModuleProps {
  warehouses: WarehouseType[];
  movements: StockMovement[];
  products: Product[];
  onTransferStock: (productId: string, fromWarehouse: string, toWarehouse: string, quantity: number, notes: string) => void;
}

export const InventoryWarehouseModule: React.FC<InventoryWarehouseModuleProps> = ({
  warehouses,
  movements,
  products,
  onTransferStock
}) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [fromWh, setFromWh] = useState(warehouses[0]?.name || 'Warehouse Alpha');
  const [toWh, setToWh] = useState(warehouses[1]?.name || 'Warehouse Beta');
  const [transferQty, setTransferQty] = useState(10);
  const [notes, setNotes] = useState('');

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTransferStock(selectedProdId, fromWh, toWh, transferQty, notes);
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <WarehouseIcon className="w-6 h-6 text-purple-400" />
            <span>Multi-Warehouse & Stock Transfers</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Facility occupancy, aisle locations, and inter-warehouse stock transfer audits</p>
        </div>
        <button
          onClick={() => setShowTransferModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Inter-Warehouse Transfer</span>
        </button>
      </div>

      {/* Warehouse Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map(w => {
          const current = w.currentCapacity ?? w.occupiedUnits ?? 0;
          const total = w.totalCapacity ?? w.capacityUnits ?? 1000;
          const occupancy = total > 0 ? Math.round((current / total) * 100) : 0;
          const locationName = w.location || w.address || 'Central Depot';
          return (
            <div key={w.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-100">{w.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{w.code}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Manager: {w.manager}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Warehouse Storage Capacity</span>
                  <span className="font-bold">{occupancy}% Full</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, occupancy))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {(current || 0).toLocaleString()} / {(total || 0).toLocaleString()} sq ft utilized
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{locationName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Audit & Movement Trail */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-slate-100">Warehouse Stock Movement Audit Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Movement Type</th>
                <th className="p-3">Qty</th>
                <th className="p-3">From / To</th>
                <th className="p-3">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-400">{m.timestamp}</td>
                  <td className="p-3 font-semibold text-slate-200">{m.productName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.type === 'Inbound' ? 'bg-emerald-500/10 text-emerald-400' :
                      m.type === 'Transfer' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-100">{m.quantity}</td>
                  <td className="p-3 text-slate-300">{m.fromLocation || 'Vendor'} → {m.toLocation}</td>
                  <td className="p-3 text-slate-400">{m.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg mb-4">Inter-Warehouse Stock Transfer</h3>
            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Product</label>
                <select value={selectedProdId} onChange={(e) => setSelectedProdId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Source Warehouse</label>
                  <select value={fromWh} onChange={(e) => setFromWh(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100">
                    {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Destination Warehouse</label>
                  <select value={toWh} onChange={(e) => setToWh(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100">
                    {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Transfer Quantity</label>
                <input type="number" min="1" value={transferQty} onChange={(e) => setTransferQty(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Transfer Reason / Audit Notes</label>
                <input type="text" placeholder="e.g. Balancing Q3 regional demand" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100" />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 bg-slate-800 text-xs rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-xs font-semibold rounded-xl">Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
