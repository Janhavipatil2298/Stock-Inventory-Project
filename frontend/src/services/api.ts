// API service layer — one function per backend endpoint.
// This replaces the old localStorage-backed storageService for all live ERP data.
// Every function talks to the Flask backend defined in inventorypro_backend/app/routes/*.

import { apiGet, apiPost, apiPut, apiDelete, setToken, clearToken, getToken } from './apiClient';
import {
  Product, Category, Supplier, Customer, Employee, SalesOrder, PurchaseOrder,
  Warehouse, StockMovement, NotificationItem, ERPConfig, User, LeaveRequest,
  LeaveStatus, AttendanceRecord, AIInsightsData
} from '../types';

// A page size large enough to bring back "everything" in one call for the
// collections the frontend expects to hold fully in memory (this app was
// built around whole-collection client state, not server pagination).
const ALL = 1000;

interface Paginated<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

async function fetchAll<T>(path: string, extraParams: Record<string, any> = {}): Promise<T[]> {
  const res = await apiGet<Paginated<T>>(path, { perPage: ALL, ...extraParams });
  return res.data;
}

// ------------------------------------------------------------------- Auth
export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function login(email: string, password: string): Promise<User> {
  const res = await apiPost<{ token: string; user: Employee }>('/api/auth/login', { email, password });
  setToken(res.token);
  return employeeToUser(res.user);
}

export async function register(payload: {
  name: string; email: string; password: string; phone?: string; department?: string;
}): Promise<User> {
  const res = await apiPost<{ token: string; user: Employee }>('/api/auth/register', payload);
  setToken(res.token);
  return employeeToUser(res.user);
}

export async function getMe(): Promise<User> {
  const emp = await apiGet<Employee>('/api/auth/me');
  return employeeToUser(emp);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiPost('/api/auth/change-password', { currentPassword, newPassword });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiPost('/api/auth/forgot-password', { email });
}

export function logout() {
  clearToken();
}

function employeeToUser(emp: Employee): User {
  return {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    role: emp.role,
    avatar: emp.avatar,
    department: emp.department,
    phone: emp.phone,
    status: emp.status === 'Terminated' ? 'inactive' : 'active',
    createdAt: emp.joinDate,
  };
}

// ---------------------------------------------------------------- Products
export const getProducts = () => fetchAll<Product>('/api/products');
export const getProduct = (id: string) => apiGet<Product>(`/api/products/${id}`);
export const createProduct = (payload: Partial<Product>) => apiPost<Product>('/api/products', payload);
export const updateProduct = (id: string, payload: Partial<Product>) => apiPut<Product>(`/api/products/${id}`, payload);
export const deleteProduct = (id: string) => apiDelete<{ message: string }>(`/api/products/${id}`);
export const getLowStockProducts = () => apiGet<Product[]>('/api/products/low-stock');
export const adjustStock = (
  id: string,
  payload: { quantity: number; type?: string; reason?: string; fromLocation?: string; toLocation?: string }
) => apiPost<{ product: Product; movement: StockMovement }>(`/api/products/${id}/adjust-stock`, payload);

// -------------------------------------------------------------- Categories
export const getCategories = () => apiGet<Category[]>('/api/categories');
export const createCategory = (payload: Partial<Category>) => apiPost<Category>('/api/categories', payload);
export const updateCategory = (id: string, payload: Partial<Category>) => apiPut<Category>(`/api/categories/${id}`, payload);
export const deleteCategory = (id: string) => apiDelete<{ message: string }>(`/api/categories/${id}`);

// -------------------------------------------------------------- Suppliers
export const getSuppliers = () => fetchAll<Supplier>('/api/suppliers');
export const createSupplier = (payload: Partial<Supplier>) => apiPost<Supplier>('/api/suppliers', payload);
export const updateSupplier = (id: string, payload: Partial<Supplier>) => apiPut<Supplier>(`/api/suppliers/${id}`, payload);
export const deleteSupplier = (id: string) => apiDelete<{ message: string }>(`/api/suppliers/${id}`);

// -------------------------------------------------------------- Customers
export const getCustomers = () => fetchAll<Customer>('/api/customers');
export const createCustomer = (payload: Partial<Customer>) => apiPost<Customer>('/api/customers', payload);
export const updateCustomer = (id: string, payload: Partial<Customer>) => apiPut<Customer>(`/api/customers/${id}`, payload);
export const deleteCustomer = (id: string) => apiDelete<{ message: string }>(`/api/customers/${id}`);

// -------------------------------------------------------------- Employees
export const getEmployees = () => fetchAll<Employee>('/api/employees');
export const createEmployee = (payload: Partial<Employee> & { password?: string }) => apiPost<Employee>('/api/employees', payload);
export const updateEmployee = (id: string, payload: Partial<Employee> & { password?: string }) => apiPut<Employee>(`/api/employees/${id}`, payload);
export const deleteEmployee = (id: string) => apiDelete<{ message: string }>(`/api/employees/${id}`);

// ------------------------------------------------------------------ Sales
export const getSalesOrders = () => fetchAll<SalesOrder>('/api/sales');
export const getSalesOrder = (id: string) => apiGet<SalesOrder>(`/api/sales/${id}`);
export const createSalesOrder = (payload: any) => apiPost<SalesOrder>('/api/sales', payload);
export const updateSalesOrder = (id: string, payload: Partial<SalesOrder>) => apiPut<SalesOrder>(`/api/sales/${id}`, payload);
export const deleteSalesOrder = (id: string) => apiDelete<{ message: string }>(`/api/sales/${id}`);

// -------------------------------------------------------------- Purchases
export const getPurchaseOrders = () => fetchAll<PurchaseOrder>('/api/purchases');
export const getPurchaseOrder = (id: string) => apiGet<PurchaseOrder>(`/api/purchases/${id}`);
export const createPurchaseOrder = (payload: any) => apiPost<PurchaseOrder>('/api/purchases', payload);
export const updatePurchaseOrder = (id: string, payload: Partial<PurchaseOrder>) => apiPut<PurchaseOrder>(`/api/purchases/${id}`, payload);
export const receivePurchaseOrder = (id: string) => apiPost<PurchaseOrder>(`/api/purchases/${id}/receive`);
export const deletePurchaseOrder = (id: string) => apiDelete<{ message: string }>(`/api/purchases/${id}`);

// ------------------------------------------------------------- Warehouses
export const getWarehouses = () => apiGet<Warehouse[]>('/api/warehouses');
export const createWarehouse = (payload: Partial<Warehouse>) => apiPost<Warehouse>('/api/warehouses', payload);
export const updateWarehouse = (id: string, payload: Partial<Warehouse>) => apiPut<Warehouse>(`/api/warehouses/${id}`, payload);
export const deleteWarehouse = (id: string) => apiDelete<{ message: string }>(`/api/warehouses/${id}`);

// -------------------------------------------------------------- Movements
export const getMovements = (productId?: string) => fetchAll<StockMovement>('/api/movements', productId ? { productId } : {});
export const createMovement = (payload: {
  productId: string; type: StockMovement['type']; quantity: number;
  fromLocation?: string; toLocation?: string; reason?: string;
}) => apiPost<StockMovement>('/api/movements', payload);

// ----------------------------------------------------------- Notifications
export const getNotifications = () => apiGet<NotificationItem[]>('/api/notifications');
export const createNotification = (payload: Partial<NotificationItem>) => apiPost<NotificationItem>('/api/notifications', payload);
export const markNotificationRead = (id: string) => apiPut<NotificationItem>(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => apiPut<{ message: string }>('/api/notifications/read-all');
export const deleteNotification = (id: string) => apiDelete<{ message: string }>(`/api/notifications/${id}`);
export const clearAllNotifications = () => apiDelete<{ message: string }>('/api/notifications');

// ------------------------------------------------------------------ Config
export const getConfig = () => apiGet<ERPConfig>('/api/config');
export const updateConfig = (payload: Partial<ERPConfig>) => apiPut<ERPConfig>('/api/config', payload);

// ----------------------------------------------------------- Leave Requests
export const getLeaveRequests = () => fetchAll<LeaveRequest>('/api/leave-requests');
export const createLeaveRequest = (payload: {
  leaveType: LeaveRequest['leaveType']; startDate: string; endDate: string; reason: string;
}) => apiPost<LeaveRequest>('/api/leave-requests', payload);
export const reviewLeaveRequest = (id: string, payload: { status: LeaveStatus; reviewNote?: string }) =>
  apiPut<LeaveRequest>(`/api/leave-requests/${id}/review`, payload);

// -------------------------------------------------------------- Attendance
export const getAttendance = () => fetchAll<AttendanceRecord>('/api/attendance');
export const clockIn = () => apiPost<AttendanceRecord>('/api/attendance/clock-in');
export const clockOut = () => apiPost<AttendanceRecord>('/api/attendance/clock-out');

// --------------------------------------------------------------- Dashboard
export const getDashboardSummary = () => apiGet<{
  totalProducts: number; lowStockCount: number; outOfStockCount: number; totalCustomers: number;
  totalEmployees: number; salesThisMonth: number; pendingPurchaseOrders: number; inventoryValue: number;
}>('/api/dashboard/summary');
export const getAIInsights = () => apiGet<AIInsightsData>('/api/dashboard/ai-insights');
