from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.models import Category, Supplier, Customer
from app.utils import min_role, paginate

catalog_bp = Blueprint("catalog", __name__, url_prefix="/api")

# ---------------------------------------------------------------- Categories
@catalog_bp.get("/categories")
@jwt_required()
def list_categories():
    return jsonify([c.to_dict() for c in Category.query.all()]), 200


@catalog_bp.post("/categories")
@min_role("admin")
def create_category():
    data = request.get_json(force=True) or {}
    c = Category(
        name=data["name"], code=data.get("code", ""), description=data.get("description", ""),
        icon_name=data.get("iconName", "box"), color=data.get("color", "#6366f1"),
    )
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201


@catalog_bp.put("/categories/<category_id>")
@min_role("admin")
def update_category(category_id):
    c = Category.query.get_or_404(category_id)
    data = request.get_json(force=True) or {}
    for json_key, attr in {"name": "name", "code": "code", "description": "description",
                            "iconName": "icon_name", "color": "color"}.items():
        if json_key in data:
            setattr(c, attr, data[json_key])
    db.session.commit()
    return jsonify(c.to_dict()), 200


@catalog_bp.delete("/categories/<category_id>")
@min_role("admin")
def delete_category(category_id):
    c = Category.query.get_or_404(category_id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Category deleted"}), 200


# ----------------------------------------------------------------- Suppliers
@catalog_bp.get("/suppliers")
@jwt_required()
def list_suppliers():
    items, meta = paginate(Supplier.query, request.args, default_per_page=50)
    return jsonify({"data": [s.to_dict() for s in items], "meta": meta}), 200


@catalog_bp.post("/suppliers")
@min_role("admin")
def create_supplier():
    data = request.get_json(force=True) or {}
    s = Supplier(
        name=data["name"], company_name=data.get("companyName", ""), email=data.get("email", ""),
        phone=data.get("phone", ""), address=data.get("address", ""), city=data.get("city", ""),
        country=data.get("country", ""), rating=data.get("rating", 0),
        lead_time_days=data.get("leadTimeDays", 0), status=data.get("status", "Active"),
    )
    db.session.add(s)
    db.session.commit()
    return jsonify(s.to_dict()), 201


@catalog_bp.put("/suppliers/<supplier_id>")
@min_role("admin")
def update_supplier(supplier_id):
    s = Supplier.query.get_or_404(supplier_id)
    data = request.get_json(force=True) or {}
    field_map = {"name": "name", "companyName": "company_name", "email": "email", "phone": "phone",
                 "address": "address", "city": "city", "country": "country", "rating": "rating",
                 "leadTimeDays": "lead_time_days", "status": "status"}
    for json_key, attr in field_map.items():
        if json_key in data:
            setattr(s, attr, data[json_key])
    db.session.commit()
    return jsonify(s.to_dict()), 200


@catalog_bp.delete("/suppliers/<supplier_id>")
@min_role("admin")
def delete_supplier(supplier_id):
    s = Supplier.query.get_or_404(supplier_id)
    db.session.delete(s)
    db.session.commit()
    return jsonify({"message": "Supplier deleted"}), 200


# ----------------------------------------------------------------- Customers
@catalog_bp.get("/customers")
@jwt_required()
def list_customers():
    items, meta = paginate(Customer.query, request.args, default_per_page=50)
    return jsonify({"data": [c.to_dict() for c in items], "meta": meta}), 200


@catalog_bp.post("/customers")
@jwt_required()
def create_customer():
    data = request.get_json(force=True) or {}
    c = Customer(
        name=data["name"], company=data.get("company", ""), email=data.get("email", ""),
        phone=data.get("phone", ""), type=data.get("type", "Retail"), address=data.get("address", ""),
        city=data.get("city", ""), outstanding_balance=data.get("outstandingBalance", 0),
    )
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201


@catalog_bp.put("/customers/<customer_id>")
@jwt_required()
def update_customer(customer_id):
    c = Customer.query.get_or_404(customer_id)
    data = request.get_json(force=True) or {}
    field_map = {"name": "name", "company": "company", "email": "email", "phone": "phone", "type": "type",
                 "address": "address", "city": "city", "outstandingBalance": "outstanding_balance"}
    for json_key, attr in field_map.items():
        if json_key in data:
            setattr(c, attr, data[json_key])
    db.session.commit()
    return jsonify(c.to_dict()), 200


@catalog_bp.delete("/customers/<customer_id>")
@min_role("admin")
def delete_customer(customer_id):
    c = Customer.query.get_or_404(customer_id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Customer deleted"}), 200
