import React from 'react';
import { BarChart3, Download, FileSpreadsheet, PieChart, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Product, SalesOrder, ERPConfig } from '../../types';
import { exportToCSV } from '../../services/storageService';

interface ReportsModuleProps {
  products: Product[];
  salesOrders: SalesOrder[];
  config: ERPConfig;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  products,
  salesOrders,
  config
}) => {
  const totalValuation = products.reduce((sum, p) => sum + (p.stockQuantity * p.purchasePrice), 0);
  const totalPotentialRevenue = products.reduce((sum, p) => sum + (p.stockQuantity * p.sellingPrice), 0);
  const totalSalesRevenue = salesOrders.reduce((sum, s) => sum + s.grandTotal, 0);

  const handleExportValuationReport = () => {
    const data = products.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.categoryName,
      Quantity: p.stockQuantity,
      UnitCost: p.purchasePrice,
      TotalCostValuation: p.stockQuantity * p.purchasePrice,
      SellingPrice: p.sellingPrice,
      PotentialRevenue: p.stockQuantity * p.sellingPrice,
      Warehouse: p.warehouse
    }));
    exportToCSV(`Valuation_Report_${new Date().toISOString().split('T')[0]}.csv`, data);
  };

  const handleExportSalesReport = () => {
    const data = salesOrders.map(s => ({
      InvoiceNo: s.invoiceNo,
      Customer: s.customerName,
      Date: s.createdDate,
      Subtotal: s.subtotal,
      Tax: s.taxTotal,
      GrandTotal: s.grandTotal,
      PaymentStatus: s.paymentStatus,
      PaymentMethod: s.paymentMethod
    }));
    exportToCSV(`Sales_Report_${new Date().toISOString().split('T')[0]}.csv`, data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Financial & Valuation Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Asset valuation, gross profit margin audit, and sales ledgers</p>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400">Total Asset Valuation (At Cost)</span>
          <p className="text-2xl font-extrabold text-slate-100">{config.currencySymbol}{totalValuation.toLocaleString()}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400">Potential Retail Revenue</span>
          <p className="text-2xl font-extrabold text-emerald-400">{config.currencySymbol}{totalPotentialRevenue.toLocaleString()}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400">Total Invoiced Sales</span>
          <p className="text-2xl font-extrabold text-cyan-400">{config.currencySymbol}{totalSalesRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1: Valuation */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Stock Valuation & Balance Sheet</h3>
              <p className="text-xs text-slate-400">Detailed asset cost analysis broken down per SKU and warehouse</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Includes purchase cost basis, safety stock thresholds, inventory holding costs, and current stock valuations.
          </p>

          <button
            onClick={handleExportValuationReport}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Valuation Ledger (CSV)</span>
          </button>
        </div>

        {/* Report 2: Sales Ledger */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Sales Invoice Revenue Audit</h3>
              <p className="text-xs text-slate-400">Completed invoices, pending receivables, and tax breakdowns</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Export full sales transactions including customer details, GST tax totals, discounts, and payment methods.
          </p>

          <button
            onClick={handleExportSalesReport}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Sales Ledger (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
