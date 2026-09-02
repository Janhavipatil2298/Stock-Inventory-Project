from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.models import NotificationItem, ERPConfig
from app.utils import min_role

notification_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")
config_bp = Blueprint("config", __name__, url_prefix="/api/config")


@notification_bp.get("")
@jwt_required()
def list_notifications():
    items = NotificationItem.query.order_by(NotificationItem.timestamp.desc()).limit(100).all()
    return jsonify([n.to_dict() for n in items]), 200


@notification_bp.put("/<notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    n = NotificationItem.query.get_or_404(notification_id)
    n.read = True
    db.session.commit()
    return jsonify(n.to_dict()), 200


@notification_bp.put("/read-all")
@jwt_required()
def mark_all_read():
    NotificationItem.query.update({NotificationItem.read: True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200


@notification_bp.delete("/<notification_id>")
@jwt_required()
def delete_notification(notification_id):
    n = NotificationItem.query.get_or_404(notification_id)
    db.session.delete(n)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200


@notification_bp.delete("")
@jwt_required()
def clear_all_notifications():
    NotificationItem.query.delete()
    db.session.commit()
    return jsonify({"message": "All notifications cleared"}), 200


@notification_bp.post("")
@jwt_required()
def create_notification():
    data = request.get_json(force=True) or {}
    n = NotificationItem(
        title=data["title"], message=data.get("message", ""), type=data.get("type", "info"),
        link_module=data.get("linkModule", ""),
    )
    db.session.add(n)
    db.session.commit()
    return jsonify(n.to_dict()), 201


# ------------------------------------------------------------------- Config
@config_bp.get("")
@jwt_required()
def get_config():
    cfg = ERPConfig.query.get(1)
    if not cfg:
        cfg = ERPConfig(id=1)
        db.session.add(cfg)
        db.session.commit()
    return jsonify(cfg.to_dict()), 200


@config_bp.put("")
@min_role("super_admin")
def update_config():
    cfg = ERPConfig.query.get(1)
    if not cfg:
        cfg = ERPConfig(id=1)
        db.session.add(cfg)
    data = request.get_json(force=True) or {}
    field_map = {"companyName": "company_name", "companyLogo": "company_logo",
                 "currencySymbol": "currency_symbol", "currencyCode": "currency_code",
                 "defaultTaxRate": "default_tax_rate",
                 "lowStockThresholdDefault": "low_stock_threshold_default", "themeMode": "theme_mode"}
    for json_key, attr in field_map.items():
        if json_key in data:
            setattr(cfg, attr, data[json_key])
    db.session.commit()
    return jsonify(cfg.to_dict()), 200
