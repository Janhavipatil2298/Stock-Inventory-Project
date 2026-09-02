import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import SalesOrder, SalesOrderItem, Product, StockMovement
from app.utils import paginate, parse_date

sales_bp = Blueprint("sales", __name__, url_prefix="/api/sales")


@sales_bp.get("")
@jwt_required()
def list_sales():
    q = SalesOrder.query
    status = request.args.get("paymentStatus")
    if status:
        q = q.filter(SalesOrder.payment_status == status)
    items, meta = paginate(q.order_by(SalesOrder.created_date.desc()), request.args, default_per_page=25)
    return jsonify({"data": [o.to_dict() for o in items], "meta": meta}), 200


@sales_bp.get("/<order_id>")
@jwt_required()
def get_sale(order_id):
    o = SalesOrder.query.get_or_404(order_id)
    return jsonify(o.to_dict()), 200


@sales_bp.post("")
@jwt_required()
def create_sale():
    """Creates a sales order, its line items, and deducts stock automatically."""
    data = request.get_json(force=True) or {}
    items_payload = data.get("items", [])
    if not items_payload:
        return jsonify({"error": "At least one line item is required"}), 400

    order = SalesOrder(
        invoice_no=data.get("invoiceNo") or f"INV-{uuid.uuid4().hex[:8].upper()}",
        customer_id=data.get("customerId"),
        payment_status=data.get("paymentStatus", "Pending"),
        payment_method=data.get("paymentMethod", "Cash"),
        due_date=parse_date(data.get("dueDate")),
        created_by=get_jwt_identity(),
        notes=data.get("notes", ""),
    )
    db.session.add(order)
    db.session.flush()  # get order.id before committing

    subtotal = tax_total = discount_total = 0
    for item in items_payload:
        product = Product.query.get(item["productId"])
        if not product:
            db.session.rollback()
            return jsonify({"error": f"Product {item.get('productId')} not found"}), 404
        if product.stock_quantity < item["quantity"]:
            db.session.rollback()
            return jsonify({"error": f"Insufficient stock for {product.name}"}), 400

        qty = int(item["quantity"])
        unit_price = float(item.get("unitPrice", product.selling_price))
        gst_rate = float(item.get("gstRate", product.gst))
        discount_rate = float(item.get("discountRate", product.discount))

        line_subtotal = qty * unit_price
        line_discount = line_subtotal * (discount_rate / 100)
        line_taxable = line_subtotal - line_discount
        line_tax = line_taxable * (gst_rate / 100)
        line_total = line_taxable + line_tax

        subtotal += line_subtotal
        discount_total += line_discount
        tax_total += line_tax

        db.session.add(SalesOrderItem(
            order_id=order.id, product_id=product.id, quantity=qty, unit_price=unit_price,
            gst_rate=gst_rate, discount_rate=discount_rate, total=line_total,
        ))

        product.stock_quantity -= qty
        db.session.add(StockMovement(
            product_id=product.id, type="Outbound", quantity=qty,
            from_location=product.warehouse or "", to_location=data.get("customerId", ""),
            performed_by=get_jwt_identity(), reason=f"Sale {order.invoice_no}",
        ))

    order.subtotal = subtotal
    order.discount_total = discount_total
    order.tax_total = tax_total
    order.grand_total = subtotal - discount_total + tax_total

    db.session.commit()
    return jsonify(order.to_dict()), 201


@sales_bp.put("/<order_id>")
@jwt_required()
def update_sale(order_id):
    order = SalesOrder.query.get_or_404(order_id)
    data = request.get_json(force=True) or {}
    for json_key, attr in {"paymentStatus": "payment_status", "paymentMethod": "payment_method",
                            "notes": "notes"}.items():
        if json_key in data:
            setattr(order, attr, data[json_key])
    if "dueDate" in data:
        order.due_date = parse_date(data["dueDate"])
    db.session.commit()
    return jsonify(order.to_dict()), 200


@sales_bp.delete("/<order_id>")
@jwt_required()
def delete_sale(order_id):
    order = SalesOrder.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Sales order deleted"}), 200
