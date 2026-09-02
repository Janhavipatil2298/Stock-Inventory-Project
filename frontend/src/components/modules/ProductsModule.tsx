import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  QrCode, 
  Barcode as BarcodeIcon, 
  Sparkles, 
  X, 
  Check, 
  Building2, 
  Tag, 
  Calendar, 
  Warehouse, 
  AlertTriangle,
  Printer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, Category, Supplier, Warehouse as WarehouseType, ERPConfig } from '../../types';
import { exportToCSV } from '../../services/storageService';

interface ProductsModuleProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  warehouses: WarehouseType[];
  config: ERPConfig;
  onAddProduct: (prod: Omit<Product, 'id' | 'createdDate'>) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  activeWarehouseFilter: string;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({
  products,
  categories,
  suppliers,
  warehouses,
  config,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  activeWarehouseFilter
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState(activeWarehouseFilter);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
    brand: '',
    categoryId: categories[0]?.id || 'cat-1',
    categoryName: categories[0]?.name || 'Electronics & Gadgets',
    supplierId: suppliers[0]?.id || 'sup-1',
    supplierName: suppliers[0]?.name || 'Apex Semiconductor Ltd',
    purchasePrice: 100,
    sellingPrice: 180,
    stockQuantity: 25,
    minimumStock: 10,
    unit: 'pcs',
    gst: config.defaultTaxRate,
    discount: 0,
    warehouse: warehouses[0]?.name || 'Warehouse Alpha',
    shelfNumber: 'A-01',
    expiryDate: '2029-12-31',
    description: '',
    tags: 'AI, Stock, Premium',
    internalNotes: '',
    status: 'In Stock' as Product['status']
  });

  const generateNewSKU = () => {
    const catCode = categories.find(c => c.id === formData.categoryId)?.code || 'GEN';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, sku: `SKU-${catCode}-${rand}` }));
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
      sku: `SKU-ELEC-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      brand: 'Apex Core',
      categoryId: categories[0]?.id || 'cat-1',
      categoryName: categories[0]?.name || 'Electronics & Gadgets',
      supplierId: suppliers[0]?.id || 'sup-1',
      supplierName: suppliers[0]?.name || 'Apex Semiconductor Ltd',
      purchasePrice: 100,
      sellingPrice: 180,
      stockQuantity: 25,
      minimumStock: 10,
      unit: 'pcs',
      gst: config.defaultTaxRate,
      discount: 0,
      warehouse: warehouses[0]?.name || 'Warehouse Alpha',
      shelfNumber: 'A-01',
      expiryDate: '2029-12-31',
      description: 'High quality industrial inventory product.',
      tags: 'ERP, Premium',
      internalNotes: 'Store in cool dry location.',
      status: 'In Stock'
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      image: p.image,
      sku: p.sku,
      barcode: p.barcode,
      brand: p.brand,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      stockQuantity: p.stockQuantity,
      minimumStock: p.minimumStock,
      unit: p.unit,
      gst: p.gst,
      discount: p.discount,
      warehouse: p.warehouse,
      shelfNumber: p.shelfNumber,
      expiryDate: p.expiryDate,
      description: p.description,
      tags: p.tags.join(', '),
      internalNotes: p.internalNotes,
      status: p.status
    });
    setShowAddEditModal(false);
    setShowAddEditModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const purchase = Number(formData.purchasePrice);
    const selling = Number(formData.sellingPrice);
    const profitMargin = selling > 0 ? Number((((selling - purchase) / selling) * 100).toFixed(2)) : 0;
    
    let calcStatus: Product['status'] = formData.status;
    if (Number(formData.stockQuantity) === 0) calcStatus = 'Out of Stock';
    else if (Number(formData.stockQuantity) <= Number(formData.minimumStock)) calcStatus = 'Low Stock';
    else calcStatus = 'In Stock';

    const catObj = categories.find(c => c.id === formData.categoryId);
    const supObj = suppliers.find(s => s.id === formData.supplierId);

    const payload = {
      name: formData.name,
      image: formData.image,
      sku: formData.sku,
      barcode: formData.barcode,
      brand: formData.brand,
      categoryId: formData.categoryId,
      categoryName: catObj?.name || formData.categoryName,
      supplierId: formData.supplierId,
      supplierName: supObj?.name || formData.supplierName,
      purchasePrice: purchase,
      sellingPrice: selling,
      stockQuantity: Number(formData.stockQuantity),
      minimumStock: Number(formData.minimumStock),
      unit: formData.unit,
      gst: Number(formData.gst),
      discount: Number(formData.discount),
      profitMargin,
      warehouse: formData.warehouse,
      shelfNumber: formData.shelfNumber,
      expiryDate: formData.expiryDate,
      description: formData.description,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      internalNotes: formData.internalNotes,
      status: calcStatus
    };

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...payload });
    } else {
      onAddProduct(payload);
    }
    setShowAddEditModal(false);
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || p.categoryName === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    const matchesWh = selectedWarehouse === 'All Warehouses' || p.warehouse === selectedWarehouse;

    return matchesSearch && matchesCat && matchesStatus && matchesWh;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    exportToCSV(`InventoryPro_Products_${new Date().toISOString().split('T')[0]}.csv`, filteredProducts);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Package className="w-6 h-6 text-cyan-400" />
            <span>Product Catalog & Stock Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage product specs, pricing, shelf locations, and live barcode tracking ({filteredProducts.length} items found)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters & View Toggles */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Product Name, SKU, Barcode, Brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          {/* Warehouse Filter */}
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All Warehouses">All Warehouses</option>
            {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
          </select>

          {/* Stock Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          {/* View Toggles */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table / Grid Render */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold">
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">SKU / Barcode</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Stock & Unit</th>
                  <th className="p-3.5">Cost & Price</th>
                  <th className="p-3.5">Margin</th>
                  <th className="p-3.5">Warehouse</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(p => {
                    const statusBadgeClass = 
                      p.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      p.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/30';

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="p-3.5">
                          <div className="flex items-center space-x-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-200 group-hover:text-cyan-300">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.brand} • Supplier: {p.supplierName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <p className="font-mono text-slate-300 font-semibold">{p.sku}</p>
                          <p className="text-[10px] font-mono text-slate-500">{p.barcode}</p>
                        </td>
                        <td className="p-3.5 text-slate-300 font-medium">
                          {p.categoryName}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-100">{p.stockQuantity} {p.unit}</p>
                          <p className="text-[10px] text-slate-500">Min safety: {p.minimumStock}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-200">{config.currencySymbol}{p.sellingPrice.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-500">Cost: {config.currencySymbol}{p.purchasePrice.toFixed(2)}</p>
                        </td>
                        <td className="p-3.5 font-bold text-emerald-400">
                          {p.profitMargin}%
                        </td>
                        <td className="p-3.5">
                          <p className="text-slate-300">{p.warehouse}</p>
                          <p className="text-[10px] text-slate-500">Shelf: {p.shelfNumber}</p>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setPreviewProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                            title="Quick Card Preview & Barcode"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-200">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedProducts.map(p => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl overflow-hidden h-36 bg-slate-800 mb-3">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-sm text-cyan-400 border border-slate-700">
                    {p.warehouse}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold">{p.categoryName}</p>
                <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{p.name}</h4>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{p.sku}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm text-slate-100">{config.currencySymbol}{p.sellingPrice.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">Qty: {p.stockQuantity} {p.unit}</p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPreviewProduct(p)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-lg text-slate-100 flex items-center space-x-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <span>{editingProduct ? 'Edit Product Specification' : 'Add New Inventory Product'}</span>
              </h3>
              <button onClick={() => setShowAddEditModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ultra-Fast AI Edge Processor Unit V3"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* SKU & Barcode */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">SKU Code</label>
                    <button type="button" onClick={generateNewSKU} className="text-[10px] text-cyan-400 font-semibold hover:underline">
                      Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Barcode Serial</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Category & Supplier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setFormData({ ...formData, categoryId: e.target.value, categoryName: cat?.name || '' });
                    }}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => {
                      const sup = suppliers.find(s => s.id === e.target.value);
                      setFormData({ ...formData, supplierId: e.target.value, supplierName: sup?.name || '' });
                    }}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Prices & Profit Margin Live Calc */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase Price ({config.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price ({config.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Live Profit Margin Readout */}
                <div className="md:col-span-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Auto-Calculated Profit Margin:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formData.sellingPrice > 0 ? (((formData.sellingPrice - formData.purchasePrice) / formData.sellingPrice) * 100).toFixed(2) : '0'}%
                  </span>
                </div>

                {/* Stock & Safety Threshold */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Safety Stock Level</label>
                  <input
                    type="number"
                    required
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Warehouse & Shelf */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Warehouse Location</label>
                  <select
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shelf Number</label>
                  <input
                    type="text"
                    required
                    value={formData.shelfNumber}
                    onChange={(e) => setFormData({ ...formData, shelfNumber: e.target.value })}
                    placeholder="e.g. A-12"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Image URL</label>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Product Preview & Barcode Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setPreviewProduct(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img src={previewProduct.image} alt={previewProduct.name} className="w-16 h-16 rounded-xl object-cover border border-slate-700" />
                <div>
                  <h3 className="font-bold text-base text-slate-100">{previewProduct.name}</h3>
                  <p className="text-xs text-slate-400">{previewProduct.brand} • {previewProduct.categoryName}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {previewProduct.warehouse} ({previewProduct.shelfNumber})
                  </span>
                </div>
              </div>

              {/* Barcode Visual Generator */}
              <div className="p-4 rounded-xl bg-white text-slate-900 text-center space-y-1 shadow-inner">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600">PRODUCT BARCODE & EAN</p>
                <div className="font-mono text-2xl font-black tracking-widest my-2 select-all">
                  ||||| ||| ||||||| |||| ||||
                </div>
                <p className="font-mono text-xs font-bold text-slate-800">{previewProduct.barcode}</p>
                <p className="font-mono text-[10px] text-slate-500">SKU: {previewProduct.sku}</p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div>
                  <span className="text-slate-400">Selling Price:</span>
                  <p className="font-bold text-slate-100">{config.currencySymbol}{previewProduct.sellingPrice}</p>
                </div>
                <div>
                  <span className="text-slate-400">Stock Available:</span>
                  <p className="font-bold text-slate-100">{previewProduct.stockQuantity} {previewProduct.unit}</p>
                </div>
                <div>
                  <span className="text-slate-400">Profit Margin:</span>
                  <p className="font-bold text-emerald-400">{previewProduct.profitMargin}%</p>
                </div>
                <div>
                  <span className="text-slate-400">GST / Tax:</span>
                  <p className="font-bold text-slate-100">{previewProduct.gst}%</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Barcode Label</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
