"""
SQLAlchemy models mirroring src/types/index.ts of the InventoryPro-AI frontend.
Every model has a to_dict() that outputs camelCase keys so the React frontend
can consume the JSON directly with no field-name mapping.
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


def gen_id(prefix):
    """Simple readable id generator e.g. PRD-0001"""
    import uuid
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


class Employee(db.Model):
    """Also doubles as the login/auth user (role: super_admin / admin / employee)."""
    __tablename__ = "employees"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("EMP"))
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(30))
    role = db.Column(db.Enum("super_admin", "admin", "employee", name="user_role"), default="employee")
    department = db.Column(db.String(80))
    status = db.Column(db.Enum("Active", "On Leave", "Terminated", name="emp_status"), default="Active")
    join_date = db.Column(db.Date, default=datetime.utcnow)
    avatar = db.Column(db.String(255), default="")

    def set_password(self, raw):
        self.password_hash = generate_password_hash(raw)

    def check_password(self, raw):
        return check_password_hash(self.password_hash, raw)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "department": self.department,
            "status": self.status,
            "joinDate": self.join_date.isoformat() if self.join_date else None,
            "avatar": self.avatar,
        }


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("CAT"))
    name = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(30))
    description = db.Column(db.Text)
    icon_name = db.Column(db.String(60))
    color = db.Column(db.String(20))

    products = db.relationship("Product", backref="category", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "iconName": self.icon_name,
            "color": self.color,
            "totalProducts": len(self.products),
        }


class Supplier(db.Model):
    __tablename__ = "suppliers"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("SUP"))
    name = db.Column(db.String(120), nullable=False)
    company_name = db.Column(db.String(150))
    email = db.Column(db.String(150))
    phone = db.Column(db.String(30))
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    rating = db.Column(db.Float, default=0)
    lead_time_days = db.Column(db.Integer, default=0)
    status = db.Column(db.Enum("Active", "Inactive", name="supplier_status"), default="Active")

    products = db.relationship("Product", backref="supplier", lazy=True)
    purchase_orders = db.relationship("PurchaseOrder", backref="supplier", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "companyName": self.company_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "city": self.city,
            "country": self.country,
            "rating": self.rating,
            "leadTimeDays": self.lead_time_days,
            "activeOrdersCount": sum(1 for po in self.purchase_orders if po.status in ("Draft", "Ordered")),
            "status": self.status,
        }


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("PRD"))
    name = db.Column(db.String(150), nullable=False)
    image = db.Column(db.String(255))
    sku = db.Column(db.String(60), unique=True, nullable=False)
    barcode = db.Column(db.String(60))
    brand = db.Column(db.String(100))
    category_id = db.Column(db.String(40), db.ForeignKey("categories.id"))
    supplier_id = db.Column(db.String(40), db.ForeignKey("suppliers.id"))
    purchase_price = db.Column(db.Numeric(12, 2), default=0)
    selling_price = db.Column(db.Numeric(12, 2), default=0)
    stock_quantity = db.Column(db.Integer, default=0)
    minimum_stock = db.Column(db.Integer, default=0)
    unit = db.Column(db.String(30), default="pcs")
    gst = db.Column(db.Float, default=0)
    discount = db.Column(db.Float, default=0)
    warehouse = db.Column(db.String(100))
    shelf_number = db.Column(db.String(40))
    expiry_date = db.Column(db.Date, nullable=True)
    description = db.Column(db.Text)
    tags = db.Column(db.String(500))  # comma separated
    internal_notes = db.Column(db.Text)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(
        db.Enum("In Stock", "Low Stock", "Out of Stock", "Discontinued", name="product_status"),
        default="In Stock",
    )

    def compute_status(self):
        if self.stock_quantity <= 0:
            return "Out of Stock"
        if self.stock_quantity <= self.minimum_stock:
            return "Low Stock"
        return "In Stock"

    def profit_margin(self):
        if not self.selling_price or float(self.selling_price) == 0:
            return 0
        return round(((float(self.selling_price) - float(self.purchase_price)) / float(self.selling_price)) * 100, 2)

    def to_dict(self):
        self.status = self.compute_status()
        return {
            "id": self.id,
            "name": self.name,
            "image": self.image,
            "sku": self.sku,
            "barcode": self.barcode,
            "brand": self.brand,
            "categoryId": self.category_id,
            "categoryName": self.category.name if self.category else "",
            "supplierId": self.supplier_id,
            "supplierName": self.supplier.name if self.supplier else "",
            "purchasePrice": float(self.purchase_price or 0),
            "sellingPrice": float(self.selling_price or 0),
            "stockQuantity": self.stock_quantity,
            "minimumStock": self.minimum_stock,
            "unit": self.unit,
            "gst": self.gst,
            "discount": self.discount,
            "profitMargin": self.profit_margin(),
            "warehouse": self.warehouse,
            "shelfNumber": self.shelf_number,
            "expiryDate": self.expiry_date.isoformat() if self.expiry_date else "",
            "description": self.description,
            "tags": self.tags.split(",") if self.tags else [],
            "internalNotes": self.internal_notes,
            "createdDate": self.created_date.isoformat() if self.created_date else None,
            "status": self.status,
        }


class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("CUS"))
    name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(150))
    email = db.Column(db.String(150))
    phone = db.Column(db.String(30))
    type = db.Column(db.Enum("B2B", "Retail", name="customer_type"), default="Retail")
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    outstanding_balance = db.Column(db.Numeric(12, 2), default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship("SalesOrder", backref="customer", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "company": self.company,
            "email": self.email,
            "phone": self.phone,
            "type": self.type,
            "address": self.address,
            "city": self.city,
            "outstandingBalance": float(self.outstanding_balance or 0),
            "totalPurchases": sum(float(o.grand_total or 0) for o in self.orders),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class SalesOrder(db.Model):
    __tablename__ = "sales_orders"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("SO"))
    invoice_no = db.Column(db.String(60), unique=True, nullable=False)
    customer_id = db.Column(db.String(40), db.ForeignKey("customers.id"))
    subtotal = db.Column(db.Numeric(12, 2), default=0)
    tax_total = db.Column(db.Numeric(12, 2), default=0)
    discount_total = db.Column(db.Numeric(12, 2), default=0)
    grand_total = db.Column(db.Numeric(12, 2), default=0)
    payment_status = db.Column(
        db.Enum("Paid", "Pending", "Overdue", "Refunded", name="payment_status"), default="Pending"
    )
    payment_method = db.Column(
        db.Enum("Cash", "Credit Card", "Bank Transfer", "UPI", name="payment_method"), default="Cash"
    )
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.Date, nullable=True)
    created_by = db.Column(db.String(40), db.ForeignKey("employees.id"))
    notes = db.Column(db.Text)

    items = db.relationship("SalesOrderItem", backref="order", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        creator = Employee.query.get(self.created_by)
        return {
            "id": self.id,
            "invoiceNo": self.invoice_no,
            "customerId": self.customer_id,
            "customerName": self.customer.name if self.customer else "",
            "items": [i.to_dict() for i in self.items],
            "subtotal": float(self.subtotal or 0),
            "taxTotal": float(self.tax_total or 0),
            "discountTotal": float(self.discount_total or 0),
            "grandTotal": float(self.grand_total or 0),
            "paymentStatus": self.payment_status,
            "paymentMethod": self.payment_method,
            "createdDate": self.created_date.isoformat() if self.created_date else None,
            "dueDate": self.due_date.isoformat() if self.due_date else "",
            "createdBy": creator.name if creator else "",
            "notes": self.notes,
        }


class SalesOrderItem(db.Model):
    __tablename__ = "sales_order_items"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.String(40), db.ForeignKey("sales_orders.id"), nullable=False)
    product_id = db.Column(db.String(40), db.ForeignKey("products.id"))
    quantity = db.Column(db.Integer, default=1)
    unit_price = db.Column(db.Numeric(12, 2), default=0)
    gst_rate = db.Column(db.Float, default=0)
    discount_rate = db.Column(db.Float, default=0)
    total = db.Column(db.Numeric(12, 2), default=0)

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "productId": self.product_id,
            "productName": self.product.name if self.product else "",
            "sku": self.product.sku if self.product else "",
            "quantity": self.quantity,
            "unitPrice": float(self.unit_price or 0),
            "gstRate": self.gst_rate,
            "discountRate": self.discount_rate,
            "total": float(self.total or 0),
        }


class PurchaseOrder(db.Model):
    __tablename__ = "purchase_orders"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("PO"))
    po_number = db.Column(db.String(60), unique=True, nullable=False)
    supplier_id = db.Column(db.String(40), db.ForeignKey("suppliers.id"))
    total_amount = db.Column(db.Numeric(12, 2), default=0)
    status = db.Column(
        db.Enum("Draft", "Ordered", "Received", "Cancelled", name="purchase_status"), default="Draft"
    )
    expected_date = db.Column(db.Date, nullable=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    warehouse = db.Column(db.String(100))
    notes = db.Column(db.Text)

    items = db.relationship("PurchaseOrderItem", backref="order", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "poNumber": self.po_number,
            "supplierId": self.supplier_id,
            "supplierName": self.supplier.name if self.supplier else "",
            "items": [i.to_dict() for i in self.items],
            "totalAmount": float(self.total_amount or 0),
            "status": self.status,
            "expectedDate": self.expected_date.isoformat() if self.expected_date else "",
            "createdDate": self.created_date.isoformat() if self.created_date else None,
            "warehouse": self.warehouse,
            "notes": self.notes,
        }


class PurchaseOrderItem(db.Model):
    __tablename__ = "purchase_order_items"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.String(40), db.ForeignKey("purchase_orders.id"), nullable=False)
    product_id = db.Column(db.String(40), db.ForeignKey("products.id"))
    quantity = db.Column(db.Integer, default=1)
    unit_cost = db.Column(db.Numeric(12, 2), default=0)
    total = db.Column(db.Numeric(12, 2), default=0)

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "productId": self.product_id,
            "productName": self.product.name if self.product else "",
            "quantity": self.quantity,
            "unitCost": float(self.unit_cost or 0),
            "total": float(self.total or 0),
        }


class Warehouse(db.Model):
    __tablename__ = "warehouses"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("WH"))
    name = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(30))
    address = db.Column(db.String(255))
    location = db.Column(db.String(150))
    manager = db.Column(db.String(120))
    capacity_units = db.Column(db.Integer, default=0)
    occupied_units = db.Column(db.Integer, default=0)
    status = db.Column(
        db.Enum("Operational", "Full", "Maintenance", name="warehouse_status"), default="Operational"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "address": self.address,
            "location": self.location,
            "manager": self.manager,
            "capacityUnits": self.capacity_units,
            "occupiedUnits": self.occupied_units,
            "totalCapacity": self.capacity_units,
            "currentCapacity": self.occupied_units,
            "status": self.status,
        }


class StockMovement(db.Model):
    __tablename__ = "stock_movements"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("MOV"))
    product_id = db.Column(db.String(40), db.ForeignKey("products.id"))
    type = db.Column(
        db.Enum("Inbound", "Outbound", "Transfer", "Adjustment", name="movement_type"), nullable=False
    )
    quantity = db.Column(db.Integer, default=0)
    from_location = db.Column(db.String(120))
    to_location = db.Column(db.String(120))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    performed_by = db.Column(db.String(40), db.ForeignKey("employees.id"))
    reason = db.Column(db.String(255))

    product = db.relationship("Product")

    def to_dict(self):
        performer = Employee.query.get(self.performed_by)
        return {
            "id": self.id,
            "productId": self.product_id,
            "productName": self.product.name if self.product else "",
            "sku": self.product.sku if self.product else "",
            "type": self.type,
            "quantity": self.quantity,
            "fromLocation": self.from_location,
            "toLocation": self.to_location,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "performedBy": performer.name if performer else "",
            "reason": self.reason,
        }


class NotificationItem(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("NTF"))
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    type = db.Column(db.Enum("alert", "warning", "info", "success", name="notif_type"), default="info")
    read = db.Column(db.Boolean, default=False)
    link_module = db.Column(db.String(60))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "type": self.type,
            "read": self.read,
            "linkModule": self.link_module,
        }


class ERPConfig(db.Model):
    __tablename__ = "erp_config"

    id = db.Column(db.Integer, primary_key=True, default=1)
    company_name = db.Column(db.String(150), default="InventoryPro")
    company_logo = db.Column(db.String(255))
    currency_symbol = db.Column(db.String(10), default="₹")
    currency_code = db.Column(db.String(10), default="INR")
    default_tax_rate = db.Column(db.Float, default=18)
    low_stock_threshold_default = db.Column(db.Integer, default=10)
    theme_mode = db.Column(db.Enum("dark", "light", name="theme_mode"), default="dark")

    def to_dict(self):
        return {
            "companyName": self.company_name,
            "companyLogo": self.company_logo,
            "currencySymbol": self.currency_symbol,
            "currencyCode": self.currency_code,
            "defaultTaxRate": self.default_tax_rate,
            "lowStockThresholdDefault": self.low_stock_threshold_default,
            "themeMode": self.theme_mode,
        }


class LeaveRequest(db.Model):
    __tablename__ = "leave_requests"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("LV"))
    employee_id = db.Column(db.String(40), db.ForeignKey("employees.id"))
    department = db.Column(db.String(80))
    leave_type = db.Column(
        db.Enum("Sick Leave", "Casual Leave", "Vacation", "Emergency", "Other", name="leave_type"),
        default="Casual Leave",
    )
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(db.Enum("Pending", "Approved", "Rejected", name="leave_status"), default="Pending")
    applied_on = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_by = db.Column(db.String(40), db.ForeignKey("employees.id"), nullable=True)
    reviewed_on = db.Column(db.DateTime, nullable=True)
    review_note = db.Column(db.Text)

    employee = db.relationship("Employee", foreign_keys=[employee_id])
    reviewer = db.relationship("Employee", foreign_keys=[reviewed_by])

    def to_dict(self):
        return {
            "id": self.id,
            "employeeId": self.employee_id,
            "employeeName": self.employee.name if self.employee else "",
            "employeeAvatar": self.employee.avatar if self.employee else "",
            "department": self.department,
            "leaveType": self.leave_type,
            "startDate": self.start_date.isoformat() if self.start_date else "",
            "endDate": self.end_date.isoformat() if self.end_date else "",
            "reason": self.reason,
            "status": self.status,
            "appliedOn": self.applied_on.isoformat() if self.applied_on else None,
            "reviewedBy": self.reviewer.name if self.reviewer else None,
            "reviewedOn": self.reviewed_on.isoformat() if self.reviewed_on else None,
            "reviewNote": self.review_note,
        }


class AttendanceRecord(db.Model):
    __tablename__ = "attendance_records"

    id = db.Column(db.String(40), primary_key=True, default=lambda: gen_id("ATT"))
    employee_id = db.Column(db.String(40), db.ForeignKey("employees.id"))
    date = db.Column(db.Date, nullable=False)
    clock_in = db.Column(db.Time, nullable=True)
    clock_out = db.Column(db.Time, nullable=True)
    status = db.Column(db.Enum("Present", "On Leave", "Absent", name="attendance_status"), default="Present")
    hours_logged = db.Column(db.Float, nullable=True)

    employee = db.relationship("Employee")

    def to_dict(self):
        return {
            "id": self.id,
            "employeeId": self.employee_id,
            "employeeName": self.employee.name if self.employee else "",
            "date": self.date.isoformat() if self.date else "",
            "clockIn": self.clock_in.strftime("%H:%M") if self.clock_in else None,
            "clockOut": self.clock_out.strftime("%H:%M") if self.clock_out else None,
            "status": self.status,
            "hoursLogged": self.hours_logged,
        }
