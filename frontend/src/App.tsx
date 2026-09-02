import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Product,
  Category,
  Supplier,
  Customer,
  Employee,
  SalesOrder,
  PurchaseOrder,
  Warehouse,
  StockMovement,
  NotificationItem,
  ERPConfig,
  LeaveRequest,
  AttendanceRecord,
  AIInsightsData
} from './types';

import * as api from './services/api';
import { isAuthenticated } from './services/api';
import { setUnauthorizedHandler, clearToken, ApiError } from './services/apiClient';
import { exportBackupJSON } from './services/storageService';

import { calculateInventoryMetrics } from './services/aiEngine';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationPanel } from './components/NotificationPanel';

import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { LogoutConfirmModal } from './components/auth/LogoutConfirmModal';

import { DashboardModule } from './components/modules/DashboardModule';
import { ProductsModule } from './components/modules/ProductsModule';
import { CategoriesModule } from './components/modules/CategoriesModule';
import { SuppliersModule } from './components/modules/SuppliersModule';
import { CustomersModule } from './components/modules/CustomersModule';
import { EmployeesModule } from './components/modules/EmployeesModule';
import { SalesModule } from './components/modules/SalesModule';
import { PurchasesModule } from './components/modules/PurchasesModule';
import { InventoryWarehouseModule } from './components/modules/InventoryWarehouseModule';
import { AIFeaturesModule } from './components/modules/AIFeaturesModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';

const FALLBACK_CONFIG: ERPConfig = {
  companyName: 'InventoryPro',
  currencySymbol: '₹',
  currencyCode: 'INR',
  defaultTaxRate: 18,
  lowStockThresholdDefault: 10,
  pythonBackendUrl: 'http://localhost:5000',
  usePythonBackend: true,
  themeMode: 'dark'
};

export default function App() {
  // 1. Auth & Bootstrap State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loadError, setLoadError] = useState('');

  // 2. Navigation & Layout State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeWarehouse, setActiveWarehouse] = useState<string>('All Warehouses');

  // 3. Global Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 4. ERP Data Collections (now sourced entirely from the Flask backend)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [config, setConfigState] = useState<ERPConfig>(FALLBACK_CONFIG);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsightsData>(() => calculateInventoryMetrics([]));

  // ---- Data loading -------------------------------------------------
  const fetchAllCollections = useCallback(async () => {
    setIsLoadingData(true);
    setLoadError('');
    try {
      const [
        productsRes, categoriesRes, suppliersRes, customersRes, employeesRes,
        salesRes, purchasesRes, warehousesRes, movementsRes, notificationsRes,
        configRes, leaveRes, attendanceRes
      ] = await Promise.all([
        api.getProducts(), api.getCategories(), api.getSuppliers(), api.getCustomers(),
        api.getEmployees(), api.getSalesOrders(), api.getPurchaseOrders(), api.getWarehouses(),
        api.getMovements(), api.getNotifications(), api.getConfig(), api.getLeaveRequests(),
        api.getAttendance()
      ]);
      setProducts(productsRes);
      setCategories(categoriesRes);
      setSuppliers(suppliersRes);
      setCustomers(customersRes);
      setEmployees(employeesRes);
      setSalesOrders(salesRes);
      setPurchaseOrders(purchasesRes);
      setWarehouses(warehousesRes);
      setMovements(movementsRes);
      setNotifications(notificationsRes);
      setConfigState(configRes);
      setLeaveRequests(leaveRes);
      setAttendance(attendanceRes);

      // AI insights come from the backend's computed endpoint; fall back to the
      // local heuristic engine only if that call fails for some reason.
      try {
        setAiInsights(await api.getAIInsights());
      } catch {
        setAiInsights(calculateInventoryMetrics(productsRes));
      }
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load data from the backend.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const refreshAIInsights = useCallback(async () => {
    try {
      setAiInsights(await api.getAIInsights());
    } catch {
      setAiInsights(calculateInventoryMetrics(products));
    }
  }, [products]);

  // ---- Auth bootstrap: restore session from a stored JWT, if any ----
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setCurrentUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      if (!isAuthenticated()) {
        setAuthChecking(false);
        return;
      }
      try {
        const user = await api.getMe();
        setCurrentUser(user);
        await fetchAllCollections();
      } catch {
        clearToken();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Theme Mode with Document Body
  useEffect(() => {
    if (config.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.themeMode]);

  // Enforce role scope: an Employee only has Dashboard (attendance, stock updates,
  // leave requests, notifications) and Warehouses (stock updates) in their nav.
  // Guard against a stale activeModule granting access to a restricted module.
  useEffect(() => {
    if (currentUser?.role === 'employee' && !['dashboard', 'inventory'].includes(activeModule)) {
      setActiveModule('dashboard');
    }
  }, [currentUser, activeModule]);

  // Handler: Auth Logins
  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    await fetchAllCollections();
  };

  const handleConfirmLogout = () => {
    api.logout();
    setCurrentUser(null);
    setAuthScreen('login');
    setIsLogoutModalOpen(false);
    // Clear in-memory data so nothing leaks between accounts.
    setProducts([]); setCategories([]); setSuppliers([]); setCustomers([]);
    setEmployees([]); setSalesOrders([]); setPurchaseOrders([]); setWarehouses([]);
    setMovements([]); setNotifications([]); setConfigState(FALLBACK_CONFIG);
    setLeaveRequests([]); setAttendance([]); setAiInsights(calculateInventoryMetrics([]));
  };

  const handleRequestLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const notifyError = (err: unknown, fallback: string) => {
    const message = err instanceof ApiError ? err.message : fallback;
    console.error(message, err);
    alert(message);
  };

  // Helper: create a notification server-side and mirror it into local state.
  const pushNotification = async (payload: Partial<NotificationItem>) => {
    try {
      const created = await api.createNotification(payload);
      setNotifications(prev => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create notification', err);
    }
  };

  // Handlers: Product CRUD
  const handleAddProduct = async (prod: Omit<Product, 'id' | 'createdDate'>) => {
    try {
      const newP = await api.createProduct(prod);
      setProducts(prev => [newP, ...prev]);

      // Record Inbound Movement for the initial stock intake
      const mov = await api.createMovement({
        productId: newP.id,
        type: 'Inbound',
        quantity: newP.stockQuantity,
        fromLocation: 'Supplier Catalog',
        toLocation: newP.warehouse || 'Warehouse Alpha',
        reason: 'Initial Product Intake'
      });
      setMovements(prev => [mov, ...prev]);
    } catch (err) {
      notifyError(err, 'Failed to add product.');
    }
  };

  const handleUpdateProduct = async (updatedP: Product) => {
    try {
      const saved = await api.updateProduct(updatedP.id, updatedP);
      setProducts(prev => prev.map(p => (p.id === saved.id ? saved : p)));
    } catch (err) {
      notifyError(err, 'Failed to update product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      notifyError(err, 'Failed to delete product.');
    }
  };

  const handleQuickRestock = async (product: Product) => {
    const reorderQty = (product.minimumStock || 10) * 3;
    try {
      const result = await api.adjustStock(product.id, {
        quantity: reorderQty,
        type: 'Inbound',
        reason: 'AI Automated Quick Reorder',
        fromLocation: 'Supplier Order',
        toLocation: product.warehouse || 'Warehouse Alpha'
      });
      setProducts(prev => prev.map(p => (p.id === result.product.id ? result.product : p)));
      setMovements(prev => [result.movement, ...prev]);

      await pushNotification({
        title: 'Stock Replenished',
        message: `Reordered ${reorderQty} ${product.unit} of ${product.name} successfully.`,
        type: 'success',
        linkModule: 'products'
      });
    } catch (err) {
      notifyError(err, 'Failed to restock product.');
    }
  };

  // Handlers: Category
  const handleAddCategory = async (cat: Category) => {
    try {
      const { id, totalProducts, ...payload } = cat;
      const created = await api.createCategory(payload);
      setCategories(prev => [created, ...prev]);
    } catch (err) {
      notifyError(err, 'Failed to add category.');
    }
  };

  const handleUpdateCategory = async (cat: Category) => {
    try {
      const updated = await api.updateCategory(cat.id, cat);
      setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch (err) {
      notifyError(err, 'Failed to update category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      notifyError(err, 'Failed to delete category.');
    }
  };

  // Handlers: Supplier
  const handleAddSupplier = async (sup: Supplier) => {
    try {
      const { id, activeOrdersCount, ...payload } = sup;
      const created = await api.createSupplier(payload);
      setSuppliers(prev => [created, ...prev]);
    } catch (err) {
      notifyError(err, 'Failed to add supplier.');
    }
  };

  const handleUpdateSupplier = async (sup: Supplier) => {
    try {
      const updated = await api.updateSupplier(sup.id, sup);
      setSuppliers(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    } catch (err) {
      notifyError(err, 'Failed to update supplier.');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await api.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      notifyError(err, 'Failed to delete supplier.');
    }
  };

  // Handlers: Customer
  const handleAddCustomer = async (cust: Customer) => {
    try {
      const { id, totalPurchases, createdAt, ...payload } = cust;
      const created = await api.createCustomer(payload);
      setCustomers(prev => [created, ...prev]);
    } catch (err) {
      notifyError(err, 'Failed to add customer.');
    }
  };

  const handleUpdateCustomer = async (cust: Customer) => {
    try {
      const updated = await api.updateCustomer(cust.id, cust);
      setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch (err) {
      notifyError(err, 'Failed to update customer.');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      notifyError(err, 'Failed to delete customer.');
    }
  };

  // Handlers: Employee
  const handleAddEmployee = async (emp: Employee) => {
    try {
      const { id, ...payload } = emp as Employee & { password?: string };
      const created = await api.createEmployee(payload);
      setEmployees(prev => [created, ...prev]);
    } catch (err) {
      notifyError(err, 'Failed to add employee.');
    }
  };

  const handleUpdateEmployee = async (emp: Employee) => {
    try {
      const updated = await api.updateEmployee(emp.id, emp);
      setEmployees(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    } catch (err) {
      notifyError(err, 'Failed to update employee.');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.deleteEmployee(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      notifyError(err, 'Failed to delete employee.');
    }
  };

  // Handlers: Sales Orders — the backend computes totals, deducts stock, and
  // logs the outbound stock movement atomically, so we just send the items.
  const handleAddSalesOrder = async (order: SalesOrder) => {
    try {
      const payload = {
        invoiceNo: order.invoiceNo,
        customerId: order.customerId,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        dueDate: order.dueDate,
        notes: order.notes,
        items: order.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          gstRate: i.gstRate,
          discountRate: i.discountRate
        }))
      };
      const created = await api.createSalesOrder(payload);
      setSalesOrders(prev => [created, ...prev]);

      // Stock was deducted server-side — resync products & movements.
      const [freshProducts, freshMovements] = await Promise.all([api.getProducts(), api.getMovements()]);
      setProducts(freshProducts);
      setMovements(freshMovements);
    } catch (err) {
      notifyError(err, 'Failed to create sales order.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: SalesOrder['paymentStatus']) => {
    try {
      const updated = await api.updateSalesOrder(orderId, { paymentStatus: status });
      setSalesOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
    } catch (err) {
      notifyError(err, 'Failed to update order status.');
    }
  };

  // Handlers: Purchase Orders
  const handleAddPurchaseOrder = async (po: PurchaseOrder) => {
    try {
      const payload = {
        poNumber: po.poNumber,
        supplierId: po.supplierId,
        status: po.status,
        expectedDate: po.expectedDate,
        warehouse: po.warehouse,
        notes: po.notes,
        items: po.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost }))
      };
      const created = await api.createPurchaseOrder(payload);
      setPurchaseOrders(prev => [created, ...prev]);
    } catch (err) {
      notifyError(err, 'Failed to create purchase order.');
    }
  };

  const handleReceivePurchaseOrder = async (poId: string) => {
    try {
      const updated = await api.receivePurchaseOrder(poId);
      setPurchaseOrders(prev => prev.map(p => (p.id === updated.id ? updated : p)));

      // Stock was replenished server-side — resync products & movements.
      const [freshProducts, freshMovements] = await Promise.all([api.getProducts(), api.getMovements()]);
      setProducts(freshProducts);
      setMovements(freshMovements);
    } catch (err) {
      notifyError(err, 'Failed to receive purchase order.');
    }
  };

  // Handlers: Warehouse Transfer (net stock unchanged — just a ledger entry)
  const handleTransferStock = async (productId: string, fromWarehouse: string, toWarehouse: string, quantity: number, notes: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    try {
      const mov = await api.createMovement({
        productId: p.id,
        type: 'Transfer',
        quantity,
        fromLocation: fromWarehouse,
        toLocation: toWarehouse,
        reason: notes || 'Warehouse Rebalancing'
      });
      setMovements(prev => [mov, ...prev]);
    } catch (err) {
      notifyError(err, 'Failed to record stock transfer.');
    }
  };

  // Handlers: Leave Requests (Employee submits, Admin/Super Admin decide)
  const handleSubmitLeaveRequest = async (payload: { leaveType: LeaveRequest['leaveType']; startDate: string; endDate: string; reason: string; }) => {
    if (!currentUser) return;
    try {
      const newReq = await api.createLeaveRequest(payload);
      setLeaveRequests(prev => [newReq, ...prev]);

      await pushNotification({
        title: 'New Leave Request',
        message: `${currentUser.name} requested ${newReq.leaveType} from ${newReq.startDate} to ${newReq.endDate}.`,
        type: 'info',
        linkModule: 'dashboard'
      });
    } catch (err) {
      notifyError(err, 'Failed to submit leave request.');
    }
  };

  const handleLeaveDecision = async (requestId: string, decision: 'Approved' | 'Rejected', note?: string) => {
    if (!currentUser) return;
    try {
      const updated = await api.reviewLeaveRequest(requestId, { status: decision, reviewNote: note });
      setLeaveRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));

      await pushNotification({
        title: decision === 'Approved' ? 'Leave Request Approved' : 'Leave Request Rejected',
        message: `${updated.employeeName}'s ${updated.leaveType} (${updated.startDate} - ${updated.endDate}) was ${decision.toLowerCase()} by ${currentUser.name}.`,
        type: decision === 'Approved' ? 'success' : 'alert',
        linkModule: 'dashboard'
      });
    } catch (err) {
      notifyError(err, 'Failed to review leave request.');
    }
  };

  // Handlers: Attendance (Employee clock in/out)
  const handleClockIn = async () => {
    if (!currentUser) return;
    try {
      const record = await api.clockIn();
      setAttendance(prev => {
        const idx = prev.findIndex(r => r.id === record.id);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = record;
          return copy;
        }
        return [record, ...prev];
      });
    } catch (err) {
      notifyError(err, 'Failed to clock in.');
    }
  };

  const handleClockOut = async () => {
    if (!currentUser) return;
    try {
      const record = await api.clockOut();
      setAttendance(prev => prev.map(r => (r.id === record.id ? record : r)));
    } catch (err) {
      notifyError(err, 'Failed to clock out.');
    }
  };

  // Handlers: Settings & Data Sync
  const handleUpdateConfig = async (cfg: ERPConfig) => {
    try {
      // pythonBackendUrl / usePythonBackend are frontend-only connection
      // settings; everything else is persisted server-side.
      const { pythonBackendUrl, usePythonBackend, ...serverFields } = cfg;
      const updated = await api.updateConfig(serverFields);
      setConfigState({ ...updated, pythonBackendUrl: cfg.pythonBackendUrl, usePythonBackend: cfg.usePythonBackend });
    } catch (err) {
      notifyError(err, 'Failed to save settings.');
    }
  };

  const handleRefreshData = () => {
    fetchAllCollections();
  };

  const handleExportBackup = () => {
    exportBackupJSON({
      products, categories, suppliers, customers, employees,
      sales: salesOrders, purchases: purchaseOrders, warehouses, movements,
      notifications, config
    });
  };

  const handleImportBackup = async (data: any) => {
    if (!data) throw new Error('Empty backup file');
    const tasks: Promise<any>[] = [];
    if (Array.isArray(data.categories)) {
      data.categories.forEach((c: Category) => {
        const { id, totalProducts, ...payload } = c;
        tasks.push(api.createCategory(payload));
      });
    }
    if (Array.isArray(data.suppliers)) {
      data.suppliers.forEach((s: Supplier) => {
        const { id, activeOrdersCount, ...payload } = s;
        tasks.push(api.createSupplier(payload));
      });
    }
    if (Array.isArray(data.customers)) {
      data.customers.forEach((c: Customer) => {
        const { id, totalPurchases, createdAt, ...payload } = c;
        tasks.push(api.createCustomer(payload));
      });
    }
    if (Array.isArray(data.products)) {
      data.products.forEach((p: Product) => {
        const { id, createdDate, categoryName, supplierName, profitMargin, ...payload } = p;
        tasks.push(api.createProduct(payload));
      });
    }
    await Promise.allSettled(tasks);
    await fetchAllCollections();
  };

  const toggleTheme = () => {
    const newTheme = config.themeMode === 'dark' ? 'light' : 'dark';
    const updatedCfg: ERPConfig = { ...config, themeMode: newTheme };
    handleUpdateConfig(updatedCfg);
  };

  // Global Search selection handler
  const handleSelectItemFromSearch = (moduleName: string) => {
    setActiveModule(moduleName);
  };

  // Notifications Handlers
  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      notifyError(err, 'Failed to mark notifications as read.');
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      notifyError(err, 'Failed to clear notifications.');
    }
  };

  // Unread notifications & low stock calculation
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const lowStockCount = products.filter(p => p.stockQuantity <= p.minimumStock).length;

  // Warehouses names list for Header dropdown
  const warehousesList = warehouses.map(w => w.name);

  // Unauthenticated Flow
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading InventoryPro AI…
      </div>
    );
  }

  if (!currentUser) {
    if (authScreen === 'register') {
      return (
        <RegisterPage
          onGoToLogin={() => setAuthScreen('login')}
          onRegisterSuccess={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => setAuthScreen('register')}
          onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
        />
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
      </>
    );
  }

  // Authenticated Main ERP Dashboard Layout
  return (
    <div className={`min-h-screen font-sans ${config.themeMode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Persistent Navigation Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        userRole={currentUser.role}
        userName={currentUser.name}
        config={config}
        toggleTheme={toggleTheme}
        onLogout={handleRequestLogout}
        lowStockCount={lowStockCount}
      />

      {/* Main Container Area */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Global Header */}
        <Header
          user={currentUser}
          config={config}
          notifications={notifications}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenQuickAdd={() => setActiveModule('products')}
          onOpenAIAssistant={() => setActiveModule('ai-insights')}
          activeWarehouse={activeWarehouse}
          setActiveWarehouse={setActiveWarehouse}
          warehousesList={warehousesList}
          unreadCount={unreadNotifCount}
          onLogout={handleRequestLogout}
        />

        {loadError && (
          <div className="mx-4 md:mx-6 lg:mx-8 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{loadError}</span>
            <button onClick={handleRefreshData} className="font-semibold underline">Retry</button>
          </div>
        )}

        {/* Dynamic Module Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoadingData && (
            <div className="mb-4 text-xs text-slate-400">Syncing with backend…</div>
          )}

          {activeModule === 'dashboard' && (
            <DashboardModule
              userRole={currentUser.role}
              currentUserName={currentUser.name}
              products={products}
              salesOrders={salesOrders}
              suppliers={suppliers}
              customers={customers}
              employees={employees}
              movements={movements}
              warehouses={warehouses}
              aiInsights={aiInsights}
              config={config}
              onNavigateModule={setActiveModule}
              onQuickRestock={handleQuickRestock}
              leaveRequests={leaveRequests}
              attendance={attendance}
              onSubmitLeaveRequest={handleSubmitLeaveRequest}
              onLeaveDecision={handleLeaveDecision}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
            />
          )}

          {activeModule === 'products' && (
            <ProductsModule
              products={products}
              categories={categories}
              suppliers={suppliers}
              warehouses={warehouses}
              config={config}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              activeWarehouseFilter={activeWarehouse}
            />
          )}

          {activeModule === 'categories' && (
            <CategoriesModule
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeModule === 'suppliers' && (
            <SuppliersModule
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}

          {activeModule === 'customers' && (
            <CustomersModule
              customers={customers}
              config={config}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeModule === 'employees' && (
            <EmployeesModule
              employees={employees}
              currentUserRole={currentUser.role}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeModule === 'sales' && (
            <SalesModule
              salesOrders={salesOrders}
              customers={customers}
              products={products}
              config={config}
              onAddSalesOrder={handleAddSalesOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeModule === 'purchases' && (
            <PurchasesModule
              purchaseOrders={purchaseOrders}
              suppliers={suppliers}
              products={products}
              warehouses={warehouses}
              config={config}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              onReceivePurchaseOrder={handleReceivePurchaseOrder}
            />
          )}

          {activeModule === 'inventory' && (
            <InventoryWarehouseModule
              warehouses={warehouses}
              movements={movements}
              products={products}
              onTransferStock={handleTransferStock}
            />
          )}

          {activeModule === 'ai-insights' && (
            <AIFeaturesModule
              aiInsights={aiInsights}
              products={products}
              onRefreshAI={refreshAIInsights}
              onQuickRestock={handleQuickRestock}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsModule
              products={products}
              salesOrders={salesOrders}
              config={config}
            />
          )}

          {activeModule === 'settings' && (
            <SettingsModule
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onRefreshData={handleRefreshData}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />
          )}
        </main>
      </div>

      {/* Global Command Search Overlay */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        suppliers={suppliers}
        customers={customers}
        salesOrders={salesOrders}
        onSelectItem={handleSelectItemFromSearch}
      />

      {/* Global Notifications Drawer */}
      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
        onSelectNotification={(module) => {
          if (module) setActiveModule(module);
        }}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        userName={currentUser?.name}
      />
    </div>
  );
}
