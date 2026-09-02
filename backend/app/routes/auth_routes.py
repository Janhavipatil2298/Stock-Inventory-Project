from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Employee
from app.utils import roles_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    data = request.get_json(force=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = Employee.query.filter(db.func.lower(Employee.email) == email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
    if user.status == "Terminated":
        return jsonify({"error": "This account has been deactivated"}), 403

    token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role, "name": user.name, "email": user.email},
    )
    return jsonify({"token": token, "user": user.to_dict()}), 200


@auth_bp.post("/register")
def register():
    """Self-registration always creates an 'employee' role account.
    Only a super_admin can elevate roles afterwards (see employee_routes.update)."""
    data = request.get_json(force=True) or {}
    required = ["name", "email", "password"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "name, email and password are required"}), 400

    email = data["email"].strip().lower()
    if Employee.query.filter(db.func.lower(Employee.email) == email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    user = Employee(
        name=data["name"],
        email=email,
        phone=data.get("phone", ""),
        department=data.get("department", "General"),
        role="employee",
        status="Active",
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role, "name": user.name, "email": user.email},
    )
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = Employee.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@auth_bp.post("/change-password")
@jwt_required()
def change_password():
    data = request.get_json(force=True) or {}
    user = Employee.query.get_or_404(get_jwt_identity())
    if not user.check_password(data.get("currentPassword", "")):
        return jsonify({"error": "Current password is incorrect"}), 401
    new_password = data.get("newPassword", "")
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400
    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200


@auth_bp.post("/forgot-password")
def forgot_password():
    """Stub: in production, send a reset email/OTP. Here we just confirm the
    account exists so the frontend's ForgotPasswordModal flow works end-to-end."""
    data = request.get_json(force=True) or {}
    email = data.get("email", "").strip().lower()
    user = Employee.query.filter(db.func.lower(Employee.email) == email).first()
    if not user:
        return jsonify({"error": "No account found with this email"}), 404
    # TODO: integrate real email/OTP delivery
    return jsonify({"message": "Password reset instructions sent to your email"}), 200
