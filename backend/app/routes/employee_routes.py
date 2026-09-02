from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models.models import Employee, LeaveRequest, AttendanceRecord
from app.utils import min_role, roles_required, paginate, parse_date
from datetime import datetime

employee_bp = Blueprint("employees", __name__, url_prefix="/api/employees")
leave_bp = Blueprint("leave", __name__, url_prefix="/api/leave-requests")
attendance_bp = Blueprint("attendance", __name__, url_prefix="/api/attendance")


# ----------------------------------------------------------------- Employees
@employee_bp.get("")
@min_role("admin")
def list_employees():
    items, meta = paginate(Employee.query, request.args, default_per_page=50)
    return jsonify({"data": [e.to_dict() for e in items], "meta": meta}), 200


@employee_bp.post("")
@min_role("admin")
def create_employee():
    data = request.get_json(force=True) or {}
    if Employee.query.filter(db.func.lower(Employee.email) == data["email"].lower()).first():
        return jsonify({"error": "An employee with this email already exists"}), 409

    # Only a super_admin can create another admin/super_admin account
    requested_role = data.get("role", "employee")
    if requested_role in ("admin", "super_admin") and get_jwt().get("role") != "super_admin":
        return jsonify({"error": "Only a super admin can assign admin roles"}), 403

    e = Employee(
        name=data["name"], email=data["email"].lower(), phone=data.get("phone", ""),
        role=requested_role, department=data.get("department", "General"),
        status=data.get("status", "Active"), avatar=data.get("avatar", ""),
    )
    e.set_password(data.get("password", "changeme123"))
    db.session.add(e)
    db.session.commit()
    return jsonify(e.to_dict()), 201


@employee_bp.put("/<employee_id>")
@min_role("admin")
def update_employee(employee_id):
    e = Employee.query.get_or_404(employee_id)
    data = request.get_json(force=True) or {}

    if "role" in data and data["role"] != e.role and get_jwt().get("role") != "super_admin":
        return jsonify({"error": "Only a super admin can change roles"}), 403

    field_map = {"name": "name", "phone": "phone", "role": "role", "department": "department",
                 "status": "status", "avatar": "avatar"}
    for json_key, attr in field_map.items():
        if json_key in data:
            setattr(e, attr, data[json_key])
    if "password" in data and data["password"]:
        e.set_password(data["password"])
    db.session.commit()
    return jsonify(e.to_dict()), 200


@employee_bp.delete("/<employee_id>")
@roles_required("super_admin")
def delete_employee(employee_id):
    e = Employee.query.get_or_404(employee_id)
    db.session.delete(e)
    db.session.commit()
    return jsonify({"message": "Employee deleted"}), 200


# ------------------------------------------------------------- Leave Requests
@leave_bp.get("")
@jwt_required()
def list_leave_requests():
    q = LeaveRequest.query
    # Regular employees only see their own requests; admins see everyone's
    if get_jwt().get("role") == "employee":
        q = q.filter(LeaveRequest.employee_id == get_jwt_identity())
    status = request.args.get("status")
    if status:
        q = q.filter(LeaveRequest.status == status)
    items, meta = paginate(q.order_by(LeaveRequest.applied_on.desc()), request.args, default_per_page=50)
    return jsonify({"data": [l.to_dict() for l in items], "meta": meta}), 200


@leave_bp.post("")
@jwt_required()
def create_leave_request():
    data = request.get_json(force=True) or {}
    employee = Employee.query.get_or_404(get_jwt_identity())
    lr = LeaveRequest(
        employee_id=employee.id, department=employee.department,
        leave_type=data.get("leaveType", "Casual Leave"),
        start_date=parse_date(data["startDate"]), end_date=parse_date(data["endDate"]),
        reason=data.get("reason", ""),
    )
    db.session.add(lr)
    db.session.commit()
    return jsonify(lr.to_dict()), 201


@leave_bp.put("/<leave_id>/review")
@min_role("admin")
def review_leave_request(leave_id):
    lr = LeaveRequest.query.get_or_404(leave_id)
    data = request.get_json(force=True) or {}
    lr.status = data.get("status", "Approved")  # Approved / Rejected
    lr.reviewed_by = get_jwt_identity()
    lr.reviewed_on = datetime.utcnow()
    lr.review_note = data.get("reviewNote", "")
    db.session.commit()
    return jsonify(lr.to_dict()), 200


# --------------------------------------------------------------- Attendance
@attendance_bp.get("")
@jwt_required()
def list_attendance():
    q = AttendanceRecord.query
    if get_jwt().get("role") == "employee":
        q = q.filter(AttendanceRecord.employee_id == get_jwt_identity())
    employee_id = request.args.get("employeeId")
    date_filter = request.args.get("date")
    if employee_id:
        q = q.filter(AttendanceRecord.employee_id == employee_id)
    if date_filter:
        q = q.filter(AttendanceRecord.date == parse_date(date_filter))
    items, meta = paginate(q.order_by(AttendanceRecord.date.desc()), request.args, default_per_page=50)
    return jsonify({"data": [a.to_dict() for a in items], "meta": meta}), 200


@attendance_bp.post("/clock-in")
@jwt_required()
def clock_in():
    today = datetime.utcnow().date()
    employee_id = get_jwt_identity()
    record = AttendanceRecord.query.filter_by(employee_id=employee_id, date=today).first()
    if record and record.clock_in:
        return jsonify({"error": "Already clocked in today"}), 400
    if not record:
        record = AttendanceRecord(employee_id=employee_id, date=today, status="Present")
        db.session.add(record)
    record.clock_in = datetime.utcnow().time()
    record.status = "Present"
    db.session.commit()
    return jsonify(record.to_dict()), 200


@attendance_bp.post("/clock-out")
@jwt_required()
def clock_out():
    today = datetime.utcnow().date()
    employee_id = get_jwt_identity()
    record = AttendanceRecord.query.filter_by(employee_id=employee_id, date=today).first()
    if not record or not record.clock_in:
        return jsonify({"error": "You must clock in first"}), 400
    record.clock_out = datetime.utcnow().time()
    clock_in_dt = datetime.combine(today, record.clock_in)
    clock_out_dt = datetime.combine(today, record.clock_out)
    record.hours_logged = round((clock_out_dt - clock_in_dt).total_seconds() / 3600, 2)
    db.session.commit()
    return jsonify(record.to_dict()), 200
