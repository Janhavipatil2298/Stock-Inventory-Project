import { Product, Category, Supplier, Customer, Employee, SalesOrder, PurchaseOrder, Warehouse, StockMovement, NotificationItem, ERPConfig, LeaveRequest, AttendanceRecord } from '../types';

export const initialConfig: ERPConfig = {
  companyName: "InventoryPro Global Corp",
  currencySymbol: "$",
  currencyCode: "USD",
  defaultTaxRate: 18,
  lowStockThresholdDefault: 10,
  pythonBackendUrl: "http://localhost:5000/api/v1",
  usePythonBackend: false,
  themeMode: "dark"
};

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Electronics & Gadgets", code: "ELEC", description: "Hardware, microchips, and smart consumer devices", iconName: "Cpu", color: "#3B82F6", totalProducts: 8 },
  { id: "cat-2", name: "Industrial Machinery", code: "IND", description: "Heavy duty equipment, hydraulic tools, and parts", iconName: "Wrench", color: "#F59E0B", totalProducts: 5 },
  { id: "cat-3", name: "Office Accessories", code: "OFFC", description: "Ergonomic furniture, stationery, and IT peripherals", iconName: "Briefcase", color: "#10B981", totalProducts: 6 },
  { id: "cat-4", name: "Raw Materials", code: "RAW", description: "Metals, plastics, rubber, and chemical compounds", iconName: "Layers", color: "#8B5CF6", totalProducts: 4 },
  { id: "cat-5", name: "Safety Equipment", code: "SAFE", description: "PPE, helmets, boots, and hazard protection gear", iconName: "ShieldAlert", color: "#EF4444", totalProducts: 5 },
];

export const initialSuppliers: Supplier[] = [
  { id: "sup-1", name: "Apex Semiconductor Ltd", companyName: "Apex Tech Inc", email: "orders@apextech.com", phone: "+1 (555) 234-8901", address: "88 Silicon Parkway", city: "San Jose", country: "USA", rating: 4.9, leadTimeDays: 5, activeOrdersCount: 2, status: "Active" },
  { id: "sup-2", name: "Vanguard Heavy Industries", companyName: "Vanguard Steel Corp", email: "supply@vanguard.de", phone: "+49 89 201822", address: "Gutenbergstrasse 14", city: "Munich", country: "Germany", rating: 4.7, leadTimeDays: 12, activeOrdersCount: 1, status: "Active" },
  { id: "sup-3", name: "LogiTech Global Logistics", companyName: "LogiTech Logistics", email: "sales@logitechglobal.com", phone: "+1 (800) 412-9988", address: "400 Freight Ave", city: "Chicago", country: "USA", rating: 4.5, leadTimeDays: 3, activeOrdersCount: 3, status: "Active" },
  { id: "sup-4", name: "Quantum Polymers & Chemicals", companyName: "QuantumChem Corp", email: "b2b@quantumchem.jp", phone: "+81 3 5555 0199", address: "Chiyoda-ku 3-2-1", city: "Tokyo", country: "Japan", rating: 4.8, leadTimeDays: 9, activeOrdersCount: 0, status: "Active" },
];

export const initialCustomers: Customer[] = [
  { id: "cust-1", name: "Nexus Systems Enterprise", company: "Nexus Systems Corp", email: "procurement@nexussystems.com", phone: "+1 (555) 900-1122", type: "B2B", address: "100 Tech Blvd", city: "Austin", outstandingBalance: 14200, totalPurchases: 185000, createdAt: "2025-01-15" },
  { id: "cust-2", name: "AeroTech Aerospace", company: "AeroTech Solutions", email: "buyer@aerotech.com", phone: "+1 (555) 888-3344", type: "B2B", address: "45 Hangar Bay Rd", city: "Seattle", outstandingBalance: 0, totalPurchases: 340000, createdAt: "2025-02-10" },
  { id: "cust-3", name: "Horizon Robotics Lab", company: "Horizon AI", email: "info@horizonrobotics.org", phone: "+1 (555) 777-6655", type: "B2B", address: "12 Innovation Way", city: "Boston", outstandingBalance: 3500, totalPurchases: 92000, createdAt: "2025-03-22" },
  { id: "cust-4", name: "Sarah Jenkins", company: "Freelance Studio", email: "sarah.j@designstudio.io", phone: "+1 (555) 321-7890", type: "Retail", address: "89 Pine Street", city: "Portland", outstandingBalance: 0, totalPurchases: 4200, createdAt: "2025-05-18" },
];

export const initialEmployees: Employee[] = [
  { id: "emp-1", name: "Alexander Vance", email: "alexander.vance@inventorypro.ai", phone: "+1 (555) 019-2831", role: "super_admin", department: "Executive Board", status: "Active", joinDate: "2024-01-01", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" },
  { id: "emp-2", name: "Elena Rostova", email: "elena.rostova@inventorypro.ai", phone: "+1 (555) 019-9922", role: "admin", department: "Warehouse Operations", status: "Active", joinDate: "2024-04-12", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200" },
  { id: "emp-3", name: "David Chen", email: "david.chen@inventorypro.ai", phone: "+1 (555) 019-3388", role: "employee", department: "Logistics & Stock Control", status: "Active", joinDate: "2024-08-01", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" },
  { id: "emp-4", name: "Sophia Patel", email: "sophia.patel@inventorypro.ai", phone: "+1 (555) 019-7711", role: "employee", department: "Sales & Dispatch", status: "Active", joinDate: "2025-02-14", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
];

export const initialProducts: Product[] = [
  {
    id: "prod-101",
    name: "Ultra-Fast AI Edge Processor Unit V3",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600",
    sku: "SKU-ELEC-9021",
    barcode: "890123456701",
    brand: "Apex Core",
    categoryId: "cat-1",
    categoryName: "Electronics & Gadgets",
    supplierId: "sup-1",
    supplierName: "Apex Semiconductor Ltd",
    purchasePrice: 420.00,
    sellingPrice: 750.00,
    stockQuantity: 42,
    minimumStock: 15,
    unit: "pcs",
    gst: 18,
    discount: 5,
    profitMargin: 44.0,
    warehouse: "Warehouse Alpha",
    shelfNumber: "A-12",
    expiryDate: "2028-12-31",
    description: "High-performance neural edge accelerator chip optimized for real-time computer vision and robotics inference.",
    tags: ["AI", "Semiconductor", "Edge Computing", "Top Seller"],
    internalNotes: "Keep stored in static-free moisture-controlled chamber.",
    createdDate: "2025-01-10",
    status: "In Stock"
  },
  {
    id: "prod-102",
    name: "Noise-Canceling Wireless Enterprise Headset Pro",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    sku: "SKU-ELEC-4420",
    barcode: "890123456702",
    brand: "SonicPro",
    categoryId: "cat-1",
    categoryName: "Electronics & Gadgets",
    supplierId: "sup-3",
    supplierName: "LogiTech Global Logistics",
    purchasePrice: 85.00,
    sellingPrice: 199.00,
    stockQuantity: 6,
    minimumStock: 12,
    unit: "pcs",
    gst: 18,
    discount: 10,
    profitMargin: 57.28,
    warehouse: "Warehouse Alpha",
    shelfNumber: "A-04",
    expiryDate: "2029-06-30",
    description: "Dual microphone active noise-canceling headset with 40-hour battery life and Bluetooth 5.3 multi-device pairing.",
    tags: ["Audio", "Wireless", "Low Stock Alert"],
    internalNotes: "High demand during Q3 remote worker refresh cycle.",
    createdDate: "2025-02-12",
    status: "Low Stock"
  },
  {
    id: "prod-103",
    name: "Hydraulic Heavy Torque Wrench Tool Kit",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
    sku: "SKU-IND-3301",
    barcode: "890123456703",
    brand: "Vanguard Heavy",
    categoryId: "cat-2",
    categoryName: "Industrial Machinery",
    supplierId: "sup-2",
    supplierName: "Vanguard Heavy Industries",
    purchasePrice: 1200.00,
    sellingPrice: 1950.00,
    stockQuantity: 18,
    minimumStock: 5,
    unit: "set",
    gst: 18,
    discount: 0,
    profitMargin: 38.46,
    warehouse: "Warehouse Beta",
    shelfNumber: "B-22",
    expiryDate: "2035-01-01",
    description: "Industrial grade hydraulic torque wrench rated up to 10,000 Nm with digital pressure calibration unit.",
    tags: ["Heavy Tool", "Industrial", "Hydraulic"],
    internalNotes: "Inspect pressure seal on delivery.",
    createdDate: "2025-03-01",
    status: "In Stock"
  },
  {
    id: "prod-104",
    name: "Ergonomic Mesh Lumbar Executive Chair",
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&q=80&w=600",
    sku: "SKU-OFFC-1102",
    barcode: "890123456704",
    brand: "ErgoWork",
    categoryId: "cat-3",
    categoryName: "Office Accessories",
    supplierId: "sup-3",
    supplierName: "LogiTech Global Logistics",
    purchasePrice: 180.00,
    sellingPrice: 380.00,
    stockQuantity: 28,
    minimumStock: 10,
    unit: "pcs",
    gst: 18,
    discount: 8,
    profitMargin: 52.63,
    warehouse: "Central Depot",
    shelfNumber: "C-01",
    expiryDate: "2032-12-31",
    description: "3D adjustable armrests, breathable Korean mesh, dynamic lumbar support, and heavy BIFMA certified base.",
    tags: ["Office", "Ergonomic", "Furniture"],
    internalNotes: "Ships flat-packed in 15kg cartons.",
    createdDate: "2025-03-15",
    status: "In Stock"
  },
  {
    id: "prod-105",
    name: "Industrial Kevlar Cut-Resistant Gloves (Pack of 50)",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
    sku: "SKU-SAFE-7711",
    barcode: "890123456705",
    brand: "ArmorSafe",
    categoryId: "cat-5",
    categoryName: "Safety Equipment",
    supplierId: "sup-4",
    supplierName: "Quantum Polymers & Chemicals",
    purchasePrice: 60.00,
    sellingPrice: 125.00,
    stockQuantity: 0,
    minimumStock: 15,
    unit: "box",
    gst: 18,
    discount: 0,
    profitMargin: 52.0,
    warehouse: "Warehouse Beta",
    shelfNumber: "B-08",
    expiryDate: "2027-11-20",
    description: "ANSI Level A5 cut protection, nitrile palm grip coating for oily machinery component handling.",
    tags: ["Safety", "PPE", "Out Of Stock"],
    internalNotes: "PO-2026-902 submitted to QuantumChem for urgent 100 boxes replenishment.",
    createdDate: "2025-04-02",
    status: "Out of Stock"
  },
  {
    id: "prod-106",
    name: "High-Purity Silicon Wafer Discs (12-inch)",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
    sku: "SKU-RAW-8812",
    barcode: "890123456706",
    brand: "QuantumSil",
    categoryId: "cat-4",
    categoryName: "Raw Materials",
    supplierId: "sup-1",
    supplierName: "Apex Semiconductor Ltd",
    purchasePrice: 850.00,
    sellingPrice: 1400.00,
    stockQuantity: 75,
    minimumStock: 20,
    unit: "pcs",
    gst: 18,
    discount: 2,
    profitMargin: 39.29,
    warehouse: "Warehouse Alpha",
    shelfNumber: "A-01",
    expiryDate: "2030-01-01",
    description: "Grade 9N ultra-clean monocrystalline silicon substrate for semiconductor fabrication.",
    tags: ["Raw Material", "Silicon", "Cleanroom"],
    internalNotes: "Must remain sealed in ISO Class 4 cleanroom container.",
    createdDate: "2025-04-20",
    status: "In Stock"
  }
];

export const initialSalesOrders: SalesOrder[] = [
  {
    id: "so-1001",
    invoiceNo: "INV-2026-001",
    customerId: "cust-1",
    customerName: "Nexus Systems Enterprise",
    items: [
      { productId: "prod-101", productName: "Ultra-Fast AI Edge Processor Unit V3", sku: "SKU-ELEC-9021", quantity: 10, unitPrice: 750.00, gstRate: 18, discountRate: 5, total: 7125.00 },
      { productId: "prod-106", productName: "High-Purity Silicon Wafer Discs (12-inch)", sku: "SKU-RAW-8812", quantity: 5, unitPrice: 1400.00, gstRate: 18, discountRate: 2, total: 6860.00 }
    ],
    subtotal: 13985.00,
    taxTotal: 2517.30,
    discountTotal: 455.00,
    grandTotal: 16502.30,
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    createdDate: "2026-08-01",
    dueDate: "2026-08-15",
    createdBy: "Sophia Patel"
  },
  {
    id: "so-1002",
    invoiceNo: "INV-2026-002",
    customerId: "cust-2",
    customerName: "AeroTech Aerospace",
    items: [
      { productId: "prod-103", productName: "Hydraulic Heavy Torque Wrench Tool Kit", sku: "SKU-IND-3301", quantity: 2, unitPrice: 1950.00, gstRate: 18, discountRate: 0, total: 3900.00 }
    ],
    subtotal: 3900.00,
    taxTotal: 702.00,
    discountTotal: 0.00,
    grandTotal: 4602.00,
    paymentStatus: "Pending",
    paymentMethod: "Credit Card",
    createdDate: "2026-08-04",
    dueDate: "2026-08-18",
    createdBy: "Sophia Patel"
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-2001",
    poNumber: "PO-2026-901",
    supplierId: "sup-1",
    supplierName: "Apex Semiconductor Ltd",
    items: [
      { productId: "prod-101", productName: "Ultra-Fast AI Edge Processor Unit V3", quantity: 20, unitCost: 420.00, total: 8400.00 }
    ],
    totalAmount: 8400.00,
    status: "Ordered",
    expectedDate: "2026-08-12",
    createdDate: "2026-08-02",
    warehouse: "Warehouse Alpha",
    notes: "Expedited shipping requested via air freight."
  },
  {
    id: "po-2002",
    poNumber: "PO-2026-902",
    supplierId: "sup-4",
    supplierName: "Quantum Polymers & Chemicals",
    items: [
      { productId: "prod-105", productName: "Industrial Kevlar Cut-Resistant Gloves (Pack of 50)", quantity: 100, unitCost: 60.00, total: 6000.00 }
    ],
    totalAmount: 6000.00,
    status: "Draft",
    expectedDate: "2026-08-20",
    createdDate: "2026-08-05",
    warehouse: "Warehouse Beta",
    notes: "Emergency restock PO for depleted safety stock."
  }
];

export const initialWarehouses: Warehouse[] = [
  { id: "wh-1", name: "Warehouse Alpha", code: "W-ALPHA", address: "Sector 4, Tech Park, Silicon Valley, CA", manager: "Elena Rostova", capacityUnits: 1000, occupiedUnits: 680, status: "Operational" },
  { id: "wh-2", name: "Warehouse Beta", code: "W-BETA", address: "Industrial Zone 9, Munich, Germany", manager: "David Chen", capacityUnits: 1500, occupiedUnits: 1120, status: "Operational" },
  { id: "wh-3", name: "Central Depot", code: "W-DEPOT", address: "Logistics Hub 2, Chicago, IL", manager: "Alexander Vance", capacityUnits: 2500, occupiedUnits: 890, status: "Operational" },
];

export const initialMovements: StockMovement[] = [
  { id: "mov-1", productId: "prod-101", productName: "Ultra-Fast AI Edge Processor Unit V3", sku: "SKU-ELEC-9021", type: "Outbound", quantity: 10, fromLocation: "Warehouse Alpha / A-12", toLocation: "Customer (Nexus Systems)", timestamp: "2026-08-01 14:30", performedBy: "David Chen", reason: "Sales Invoice INV-2026-001" },
  { id: "mov-2", productId: "prod-105", productName: "Industrial Kevlar Cut-Resistant Gloves", sku: "SKU-SAFE-7711", type: "Outbound", quantity: 20, fromLocation: "Warehouse Beta / B-08", toLocation: "Customer (Factory Order)", timestamp: "2026-08-03 11:15", performedBy: "Elena Rostova", reason: "Stock Outfall" },
  { id: "mov-3", productId: "prod-106", productName: "High-Purity Silicon Wafer Discs", sku: "SKU-RAW-8812", type: "Transfer", quantity: 15, fromLocation: "Central Depot", toLocation: "Warehouse Alpha / A-01", timestamp: "2026-08-05 09:00", performedBy: "David Chen", reason: "Inter-warehouse stock rebalance" },
];

export const initialNotifications: NotificationItem[] = [
  { id: "notif-1", title: "Low Stock Alert", message: "Noise-Canceling Headset Pro is below safety threshold (6 left).", timestamp: "10 mins ago", type: "warning", read: false, linkModule: "products" },
  { id: "notif-2", title: "Out of Stock Warning", message: "Industrial Kevlar Cut-Resistant Gloves reached 0 quantity.", timestamp: "1 hour ago", type: "alert", read: false, linkModule: "products" },
  { id: "notif-3", title: "Sales Invoice Paid", message: "Nexus Systems paid $16,502.30 for INV-2026-001.", timestamp: "3 hours ago", type: "success", read: true, linkModule: "sales" },
  { id: "notif-4", title: "AI Forecast Updated", message: "AI predicts 24% spike in AI Edge Processor demand next month.", timestamp: "Yesterday", type: "info", read: true, linkModule: "ai-insights" },
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    employeeId: "emp-4",
    employeeName: "Sophia Patel",
    employeeAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    department: "Sales & Dispatch",
    leaveType: "Casual Leave",
    startDate: "2026-08-12",
    endDate: "2026-08-13",
    reason: "Family function out of town, back on the 14th.",
    status: "Pending",
    appliedOn: "2026-08-06"
  },
  {
    id: "leave-2",
    employeeId: "emp-3",
    employeeName: "David Chen",
    employeeAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    department: "Logistics & Stock Control",
    leaveType: "Sick Leave",
    startDate: "2026-07-20",
    endDate: "2026-07-21",
    reason: "Fever, recommended rest by physician.",
    status: "Approved",
    appliedOn: "2026-07-19",
    reviewedBy: "Elena Rostova",
    reviewedOn: "2026-07-19",
    reviewNote: "Get well soon."
  }
];

export const initialAttendance: AttendanceRecord[] = [
  { id: "att-1", employeeId: "emp-3", employeeName: "David Chen", date: "2026-08-07", clockIn: "09:02 AM", clockOut: "06:05 PM", status: "Present", hoursLogged: 9 },
  { id: "att-2", employeeId: "emp-4", employeeName: "Sophia Patel", date: "2026-08-07", clockIn: "09:14 AM", clockOut: "05:50 PM", status: "Present", hoursLogged: 8.6 },
];
