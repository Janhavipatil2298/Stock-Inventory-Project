from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Product, StockMovement
from app.utils import min_role, paginate, parse_date

product_bp = Blueprint("products", __name__, url_prefix="/api/products")


@product_bp.get("")
@jwt_required()
def list_products():
    q = Product.query
    search = request.args.get("search")
    category_id = request.args.get("categoryId")
    status = request.args.get("status")
    if search:
        like = f"%{search}%"
        q = q.filter(db.or_(Product.name.ilike(like), Product.sku.ilike(like), Product.barcode.ilike(like)))
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if status:
        q = q.filter(Product.status == status)

    items, meta = paginate(q.order_by(Product.created_date.desc()), request.args)
    return jsonify({"data": [p.to_dict() for p in items], "meta": meta}), 200


@product_bp.get("/<product_id>")
@jwt_required()
def get_product(product_id):
    p = Product.query.get_or_404(product_id)
    return jsonify(p.to_dict()), 200


@product_bp.post("")
@min_role("admin")
def create_product():
    data = request.get_json(force=True) or {}
    p = Product(
        name=data["name"],
        image=data.get("image", ""),
        sku=data["sku"],
        barcode=data.get("barcode", ""),
        brand=data.get("brand", ""),
        category_id=data.get("categoryId"),
        supplier_id=data.get("supplierId"),
        purchase_price=data.get("purchasePrice", 0),
        selling_price=data.get("sellingPrice", 0),
        stock_quantity=data.get("stockQuantity", 0),
        minimum_stock=data.get("minimumStock", 0),
        unit=data.get("unit", "pcs"),
        gst=data.get("gst", 0),
        discount=data.get("discount", 0),
        warehouse=data.get("warehouse", ""),
        shelf_number=data.get("shelfNumber", ""),
        expiry_date=parse_date(data.get("expiryDate")),
        description=data.get("description", ""),
        tags=",".join(data.get("tags", [])) if isinstance(data.get("tags"), list) else data.get("tags", ""),
        internal_notes=data.get("internalNotes", ""),
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201


@product_bp.put("/<product_id>")
@min_role("admin")
def update_product(product_id):
    p = Product.query.get_or_404(product_id)
    data = request.get_json(force=True) or {}

    field_map = {
        "name": "name", "image": "image", "sku": "sku", "barcode": "barcode", "brand": "brand",
        "categoryId": "category_id", "supplierId": "supplier_id", "purchasePrice": "purchase_price",
        "sellingPrice": "selling_price", "stockQuantity": "stock_quantity", "minimumStock": "minimum_stock",
        "unit": "unit", "gst": "gst", "discount": "discount", "warehouse": "warehouse",
        "shelfNumber": "shelf_number", "description": "description", "internalNotes": "internal_notes",
    }
    for json_key, attr in field_map.items():
        if json_key in data:
            setattr(p, attr, data[json_key])
    if "expiryDate" in data:
        p.expiry_date = parse_date(data["expiryDate"])
    if "tags" in data:
        p.tags = ",".join(data["tags"]) if isinstance(data["tags"], list) else data["tags"]

    db.session.commit()
    return jsonify(p.to_dict()), 200


@product_bp.delete("/<product_id>")
@min_role("admin")
def delete_product(product_id):
    p = Product.query.get_or_404(product_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200


@product_bp.post("/<product_id>/adjust-stock")
@jwt_required()
def adjust_stock(product_id):
    """Adjust stock and automatically log a StockMovement (used by Inventory/Warehouse module)."""
    p = Product.query.get_or_404(product_id)
    data = request.get_json(force=True) or {}
    quantity = int(data.get("quantity", 0))
    movement_type = data.get("type", "Adjustment")  # Inbound / Outbound / Transfer / Adjustment
    reason = data.get("reason", "")
    from_location = data.get("fromLocation", "")
    to_location = data.get("toLocation", p.warehouse or "")

    if movement_type in ("Inbound",):
        p.stock_quantity += quantity
    elif movement_type in ("Outbound",):
        p.stock_quantity = max(0, p.stock_quantity - quantity)
    else:
        p.stock_quantity = quantity  # Adjustment sets absolute value

    movement = StockMovement(
        product_id=p.id, type=movement_type, quantity=quantity,
        from_location=from_location, to_location=to_location,
        performed_by=get_jwt_identity(), reason=reason,
    )
    db.session.add(movement)
    db.session.commit()
    return jsonify({"product": p.to_dict(), "movement": movement.to_dict()}), 200


@product_bp.get("/low-stock")
@jwt_required()
def low_stock():
    items = Product.query.filter(Product.stock_quantity <= Product.minimum_stock).all()
    return jsonify([p.to_dict() for p in items]), 200
