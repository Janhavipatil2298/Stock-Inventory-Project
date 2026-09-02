"""
Creates all tables and seeds a minimal starter dataset, including the
default Super Admin login used by the frontend's LoginPage:
    email:    alexander.vance@inventorypro.ai
    password: Passw0rd!  (change this immediately after first login)

Run with:  python seed.py
"""
from datetime import date
from app import create_app
from app.extensions import db
from app.models.models import (
    Employee, Category, Supplier, Product, Customer, Warehouse, ERPConfig, NotificationItem
)

app = create_app()

with app.app_context():
    db.create_all()

    if not Employee.query.filter_by(email="alexander.vance@inventorypro.ai").first():
        super_admin = Employee(
            name="Alexander Vance",
            email="alexander.vance@inventorypro.ai",
            role="super_admin",
            department="Executive",
            status="Active",
            join_date=date(2022, 1, 10),
        )
        super_admin.set_password("Passw0rd!")
        db.session.add(super_admin)

    if not Employee.query.filter_by(email="admin@inventorypro.ai").first():
        admin = Employee(
            name="Priya Sharma", email="admin@inventorypro.ai", role="admin",
            department="Operations", status="Active", join_date=date(2023, 3, 1),
        )
        admin.set_password("Passw0rd!")
        db.session.add(admin)

    if not Employee.query.filter_by(email="employee@inventorypro.ai").first():
        emp = Employee(
            name="Rahul Verma", email="employee@inventorypro.ai", role="employee",
            department="Warehouse", status="Active", join_date=date(2023, 6, 15),
        )
        emp.set_password("Passw0rd!")
        db.session.add(emp)

    if not ERPConfig.query.get(1):
        db.session.add(ERPConfig(id=1, company_name="InventoryPro", currency_symbol="₹", currency_code="INR"))

    if Category.query.count() == 0:
        cat_electronics = Category(name="Electronics", code="ELEC", description="Electronic goods", icon_name="cpu", color="#6366f1")
        cat_grocery = Category(name="Grocery", code="GROC", description="Grocery items", icon_name="shopping-basket", color="#22c55e")
        db.session.add_all([cat_electronics, cat_grocery])
        db.session.flush()

        supplier = Supplier(
            name="TechSource Pvt Ltd", company_name="TechSource Pvt Ltd", email="sales@techsource.example",
            phone="+91-9876543210", address="MIDC Industrial Area", city="Pune", country="India",
            rating=4.5, lead_time_days=7, status="Active",
        )
        db.session.add(supplier)
        db.session.flush()

        warehouse = Warehouse(
            name="Main Warehouse", code="WH-01", address="Satara, Maharashtra", manager="Rahul Verma",
            capacity_units=10000, occupied_units=2500, status="Operational",
        )
        db.session.add(warehouse)

        product = Product(
            name="Wireless Mouse", sku="ELEC-WM-001", barcode="8901234567890", brand="LogiTech",
            category_id=cat_electronics.id, supplier_id=supplier.id, purchase_price=350, selling_price=599,
            stock_quantity=120, minimum_stock=20, unit="pcs", gst=18, discount=0,
            warehouse="Main Warehouse", shelf_number="A1-03", description="Ergonomic wireless mouse",
        )
        db.session.add(product)

        customer = Customer(
            name="Ravi Kumar", company="Kumar Retail", email="ravi.kumar@example.com",
            phone="+91-9123456780", type="B2B", address="MG Road", city="Satara",
        )
        db.session.add(customer)

        db.session.add(NotificationItem(
            title="Welcome to InventoryPro", message="Your ERP backend is up and running.",
            type="success", link_module="dashboard",
        ))

    db.session.commit()
    print("✅ Database seeded successfully.")
    print("   Super Admin login -> alexander.vance@inventorypro.ai / Passw0rd!")
