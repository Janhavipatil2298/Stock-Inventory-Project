from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request

ROLE_RANK = {"employee": 1, "admin": 2, "super_admin": 3}


def roles_required(*allowed_roles):
    """Restrict an endpoint to specific roles, e.g. @roles_required('admin', 'super_admin')."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                return jsonify({"error": "Forbidden: insufficient role"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def min_role(role_name):
    """Restrict an endpoint to a role rank >= role_name, e.g. @min_role('admin')."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role", "employee")
            if ROLE_RANK.get(role, 0) < ROLE_RANK.get(role_name, 99):
                return jsonify({"error": "Forbidden: insufficient role"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def paginate(query, request_args, default_per_page=20, max_per_page=100):
    page = max(int(request_args.get("page", 1)), 1)
    per_page = min(int(request_args.get("perPage", default_per_page)), max_per_page)
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, {
        "page": page,
        "perPage": per_page,
        "total": total,
        "totalPages": (total + per_page - 1) // per_page if per_page else 0,
    }


def parse_date(value):
    from datetime import datetime
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None
