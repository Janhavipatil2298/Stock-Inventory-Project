export type UserRole = 'super_admin' | 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued';

export interface Product {
  id: string;
  name: string;
  image: string;
  sku: string;
  barcode: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  supplierName: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minimumStock: number;
  unit: string; // pcs, kg, box, set, carton, meter, liter
  gst: number; // percentage e.g. 18
  discount: number; // percentage e.g. 5
  profitMargin: number; // auto calculated %
  warehouse: string;
  shelfNumber: string;
  expiryDate: string; // YYYY-MM-DD
  description: string;
  tags: string[];
  internalNotes: string;
  createdDate: string;
  status: ProductStatus;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  color: string;
  totalProducts: number;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  rating: number; // 1 to 5 stars
  leadTimeDays: number;
  activeOrdersCount: number;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: 'B2B' | 'Retail';
  address: string;
  city: string;
  outstandingBalance: number;
  totalPurchases: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  joinDate: string;
  avatar: string;
}

export interface SalesOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  discountRate: number;
  total: number;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Refunded';

export interface SalesOrder {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  items: SalesOrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'UPI';
  createdDate: string;
  dueDate: string;
  createdBy: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export type PurchaseStatus = 'Draft' | 'Ordered' | 'Received' | 'Cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseStatus;
  expectedDate: string;
  createdDate: string;
  warehouse: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  location?: string;
  manager: string;
  capacityUnits: number;
  occupiedUnits: number;
  totalCapacity?: number;
  currentCapacity?: number;
  status: 'Operational' | 'Full' | 'Maintenance';
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'Inbound' | 'Outbound' | 'Transfer' | 'Adjustment';
  quantity: number;
  fromLocation: string;
  toLocation: string;
  timestamp: string;
  performedBy: string;
  reason: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  read: boolean;
  linkModule?: string;
}

export interface AIInsightsData {
  inventoryHealthScore: number; // 0 - 100
  lowStockRiskCount: number;
  fastMovingCount: number;
  slowMovingCount: number;
  predictedOutofStockDays: number;
  recommendations: {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    category: 'Restock' | 'Warehouse' | 'Pricing' | 'Demand';
    actionText?: string;
    productId?: string;
  }[];
  forecast: {
    month: string;
    actualSales?: number;
    forecastSales: number;
    upperBound: number;
    lowerBound: number;
  }[];
  abcMatrix: {
    productId: string;
    productName: string;
    sku: string;
    category: 'A (High Value)' | 'B (Moderate)' | 'C (Low Value)';
    revenueContributionPct: number;
    turnoverVelocity: 'Fast' | 'Medium' | 'Slow';
  }[];
}

export interface ERPConfig {
  companyName: string;
  companyLogo?: string;
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number;
  lowStockThresholdDefault: number;
  pythonBackendUrl: string; // For python Flask/FastAPI/Django backend integration
  usePythonBackend: boolean;
  themeMode: 'dark' | 'light';
}

export type LeaveType = 'Sick Leave' | 'Casual Leave' | 'Vacation' | 'Emergency' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewedOn?: string;
  reviewNote?: string;
}

export type AttendanceStatus = 'Present' | 'On Leave' | 'Absent';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn?: string;
  clockOut?: string;
  status: AttendanceStatus;
  hoursLogged?: number;
}
