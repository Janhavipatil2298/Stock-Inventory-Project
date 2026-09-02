import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import PurchaseOrder, PurchaseOrderItem, Product, StockMovement
from app.utils import min_role, paginate, parse_date

purchase_bp = Blueprint("purchases", __name__, url_prefix="/api/purchases")


@purchase_bp.get("")
@jwt_required()
def list_purchases():
    q = PurchaseOrder.query
    status = request.args.get("status")
    if status:
        q = q.filter(PurchaseOrder.status == status)
    items, meta = paginate(q.order_by(PurchaseOrder.created_date.desc()), request.args, default_per_page=25)
    return jsonify({"data": [o.to_dict() for o in items], "meta": meta}), 200


@purchase_bp.get("/<order_id>")
@jwt_required()
def get_purchase(order_id):
    o = PurchaseOrder.query.get_or_404(order_id)
    return jsonify(o.to_dict()), 200


@purchase_bp.post("")
@min_role("admin")
def create_purchase():
    data = request.get_json(force=True) or {}
    items_payload = data.get("items", [])
    if not items_payload:
        return jsonify({"error": "At least one line item is required"}), 400

    order = PurchaseOrder(
        po_number=data.get("poNumber") or f"PO-{uuid.uuid4().hex[:8].upper()}",
        supplier_id=data.get("supplierId"),
        status=data.get("status", "Draft"),
        expected_date=parse_date(data.get("expectedDate")),
        warehouse=data.get("warehouse", ""),
        notes=data.get("notes", ""),
    )
    db.session.add(order)
    db.session.flush()

    total = 0
    for item in items_payload:
        qty = int(item["quantity"])
        unit_cost = float(item.get("unitCost", 0))
        line_total = qty * unit_cost
        total += line_total
        db.session.add(PurchaseOrderItem(
            order_id=order.id, product_id=item["productId"], quantity=qty,
            unit_cost=unit_cost, total=line_total,
        ))
    order.total_amount = total
    db.session.commit()
    return jsonify(order.to_dict()), 201


@purchase_bp.put("/<order_id>")
@min_role("admin")
def update_purchase(order_id):
    order = PurchaseOrder.query.get_or_404(order_id)
    data = request.get_json(force=True) or {}
    for json_key, attr in {"status": "status", "warehouse": "warehouse", "notes": "notes"}.items():
        if json_key in data:
            setattr(order, attr, data[json_key])
    if "expectedDate" in data:
        order.expected_date = parse_date(data["expectedDate"])
    db.session.commit()
    return jsonify(order.to_dict()), 200


@purchase_bp.post("/<order_id>/receive")
@min_role("admin")
def receive_purchase(order_id):
    """Marks a PO as Received and increments product stock + logs Inbound movements."""
    order = PurchaseOrder.query.get_or_404(order_id)
    if order.status == "Received":
        return jsonify({"error": "Purchase order already received"}), 400

    for item in order.items:
        product = Product.query.get(item.product_id)
        if product:
            product.stock_quantity += item.quantity
            db.session.add(StockMovement(
                product_id=product.id, type="Inbound", quantity=item.quantity,
                from_location=order.supplier.name if order.supplier else "Supplier",
                to_location=order.warehouse or product.warehouse or "",
                performed_by=get_jwt_identity(), reason=f"PO Received {order.po_number}",
            ))
    order.status = "Received"
    db.session.commit()
    return jsonify(order.to_dict()), 200


@purchase_bp.delete("/<order_id>")
@min_role("admin")
def delete_purchase(order_id):
    order = PurchaseOrder.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Purchase order deleted"}), 200
