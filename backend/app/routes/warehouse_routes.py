from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Warehouse, StockMovement
from app.utils import min_role, paginate

warehouse_bp = Blueprint("warehouses", __name__, url_prefix="/api/warehouses")
movement_bp = Blueprint("movements", __name__, url_prefix="/api/movements")


@warehouse_bp.get("")
@jwt_required()
def list_warehouses():
    return jsonify([w.to_dict() for w in Warehouse.query.all()]), 200


@warehouse_bp.post("")
@min_role("admin")
def create_warehouse():
    data = request.get_json(force=True) or {}
    w = Warehouse(
        name=data["name"], code=data.get("code", ""), address=data.get("address", ""),
        location=data.get("location", ""), manager=data.get("manager", ""),
        capacity_units=data.get("capacityUnits", 0), occupied_units=data.get("occupiedUnits", 0),
        status=data.get("status", "Operational"),
    )
    db.session.add(w)
    db.session.commit()
    return jsonify(w.to_dict()), 201


@warehouse_bp.put("/<warehouse_id>")
@min_role("admin")
def update_warehouse(warehouse_id):
    w = Warehouse.query.get_or_404(warehouse_id)
    data = request.get_json(force=True) or {}
    field_map = {"name": "name", "code": "code", "address": "address", "location": "location",
                 "manager": "manager", "capacityUnits": "capacity_units",
                 "occupiedUnits": "occupied_units", "status": "status"}
    for json_key, attr in field_map.items():
        if json_key in data:
            setattr(w, attr, data[json_key])
    db.session.commit()
    return jsonify(w.to_dict()), 200


@warehouse_bp.delete("/<warehouse_id>")
@min_role("admin")
def delete_warehouse(warehouse_id):
    w = Warehouse.query.get_or_404(warehouse_id)
    db.session.delete(w)
    db.session.commit()
    return jsonify({"message": "Warehouse deleted"}), 200


# --------------------------------------------------------------- Movements
@movement_bp.get("")
@jwt_required()
def list_movements():
    q = StockMovement.query.order_by(StockMovement.timestamp.desc())
    product_id = request.args.get("productId")
    if product_id:
        q = q.filter(StockMovement.product_id == product_id)
    items, meta = paginate(q, request.args, default_per_page=50)
    return jsonify({"data": [m.to_dict() for m in items], "meta": meta}), 200


@movement_bp.post("")
@jwt_required()
def create_movement():
    """
    Records a movement WITHOUT touching product.stockQuantity — used for
    warehouse-to-warehouse Transfer logging (net stock unchanged) and manual
    ledger entries. For movements that should also change stock, use
    POST /api/products/<id>/adjust-stock instead.
    """
    data = request.get_json(force=True) or {}
    m = StockMovement(
        product_id=data["productId"], type=data.get("type", "Transfer"),
        quantity=data.get("quantity", 0), from_location=data.get("fromLocation", ""),
        to_location=data.get("toLocation", ""), performed_by=get_jwt_identity(),
        reason=data.get("reason", ""),
    )
    db.session.add(m)
    db.session.commit()
    return jsonify(m.to_dict()), 201
