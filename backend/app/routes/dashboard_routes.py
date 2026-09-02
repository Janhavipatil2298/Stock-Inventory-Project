from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.models import Product, SalesOrder, PurchaseOrder, Customer, Employee, StockMovement

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.get("/summary")
@jwt_required()
def summary():
    """Feeds AdminDashboard / SuperAdminDashboard / EmployeeDashboard KPI cards."""
    total_products = Product.query.count()
    low_stock = Product.query.filter(Product.stock_quantity <= Product.minimum_stock).count()
    out_of_stock = Product.query.filter(Product.stock_quantity <= 0).count()
    total_customers = Customer.query.count()
    total_employees = Employee.query.count()

    sales_this_month = db.session.query(db.func.coalesce(db.func.sum(SalesOrder.grand_total), 0)).filter(
        db.extract("month", SalesOrder.created_date) == datetime.utcnow().month,
        db.extract("year", SalesOrder.created_date) == datetime.utcnow().year,
    ).scalar()

    pending_purchase_orders = PurchaseOrder.query.filter(
        PurchaseOrder.status.in_(["Draft", "Ordered"])
    ).count()

    inventory_value = db.session.query(
        db.func.coalesce(db.func.sum(Product.stock_quantity * Product.purchase_price), 0)
    ).scalar()

    return jsonify({
        "totalProducts": total_products,
        "lowStockCount": low_stock,
        "outOfStockCount": out_of_stock,
        "totalCustomers": total_customers,
        "totalEmployees": total_employees,
        "salesThisMonth": float(sales_this_month or 0),
        "pendingPurchaseOrders": pending_purchase_orders,
        "inventoryValue": float(inventory_value or 0),
    }), 200


@dashboard_bp.get("/ai-insights")
@jwt_required()
def ai_insights():
    """
    Feeds AIFeaturesModule. Computes real numbers from the DB (health score,
    ABC analysis, low/fast-moving counts) and returns them in the exact
    AIInsightsData shape the frontend expects (src/types/index.ts).
    Recommendations/forecast use simple heuristics — swap in a real model
    or call an external AI service here if desired.
    """
    products = Product.query.all()
    total = len(products) or 1
    low_stock_products = [p for p in products if p.stock_quantity <= p.minimum_stock]
    out_of_stock = [p for p in products if p.stock_quantity <= 0]

    healthy_ratio = 1 - (len(low_stock_products) / total)
    health_score = round(max(0, min(100, healthy_ratio * 100)))

    # Fast/slow movers by outbound movement count in the last 30 days
    since = datetime.utcnow() - timedelta(days=30)
    movement_counts = {}
    movements = StockMovement.query.filter(
        StockMovement.type == "Outbound", StockMovement.timestamp >= since
    ).all()
    for m in movements:
        movement_counts[m.product_id] = movement_counts.get(m.product_id, 0) + m.quantity

    sorted_products = sorted(products, key=lambda p: movement_counts.get(p.id, 0), reverse=True)
    fast_moving = sorted_products[: max(1, total // 5)]
    slow_moving = sorted_products[-max(1, total // 5):]

    recommendations = []
    for p in low_stock_products[:5]:
        recommendations.append({
            "id": f"rec-restock-{p.id}",
            "title": f"Restock {p.name}",
            "description": f"{p.name} has {p.stock_quantity} units left, below the minimum of {p.minimum_stock}.",
            "priority": "High" if p.stock_quantity == 0 else "Medium",
            "category": "Restock",
            "actionText": "Create purchase order",
            "productId": p.id,
        })

    # ABC analysis by revenue contribution (selling_price * stock_quantity as proxy)
    revenue_values = [(p, float(p.selling_price or 0) * p.stock_quantity) for p in products]
    total_revenue = sum(v for _, v in revenue_values) or 1
    revenue_values.sort(key=lambda x: x[1], reverse=True)

    abc_matrix = []
    cumulative = 0
    for p, val in revenue_values[:20]:
        pct = round((val / total_revenue) * 100, 2)
        cumulative += pct
        category = "A (High Value)" if cumulative <= 70 else ("B (Moderate)" if cumulative <= 90 else "C (Low Value)")
        velocity = "Fast" if p in fast_moving else ("Slow" if p in slow_moving else "Medium")
        abc_matrix.append({
            "productId": p.id, "productName": p.name, "sku": p.sku,
            "category": category, "revenueContributionPct": pct, "turnoverVelocity": velocity,
        })

    # Simple 6-month sales forecast based on trailing average (heuristic placeholder)
    monthly_actuals = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        month_date = (now.replace(day=1) - timedelta(days=1)) if i == 0 else now
        target_month = ((now.month - i - 1) % 12) + 1
        target_year = now.year - ((now.month - i - 1) < 0)
        total_sales = db.session.query(db.func.coalesce(db.func.sum(SalesOrder.grand_total), 0)).filter(
            db.extract("month", SalesOrder.created_date) == target_month,
            db.extract("year", SalesOrder.created_date) == target_year,
        ).scalar()
        monthly_actuals.append(float(total_sales or 0))

    avg_sales = (sum(monthly_actuals) / len(monthly_actuals)) if monthly_actuals else 0
    forecast = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for i, actual in enumerate(monthly_actuals):
        m_index = (now.month - (5 - i) - 1) % 12
        forecast.append({
            "month": month_names[m_index],
            "actualSales": actual,
            "forecastSales": round(avg_sales, 2),
            "upperBound": round(avg_sales * 1.15, 2),
            "lowerBound": round(avg_sales * 0.85, 2),
        })

    predicted_days = 0
    if low_stock_products:
        rates = [movement_counts.get(p.id, 1) / 30 for p in low_stock_products]
        avg_rate = max(sum(rates) / len(rates), 0.1)
        avg_stock = sum(p.stock_quantity for p in low_stock_products) / len(low_stock_products)
        predicted_days = round(avg_stock / avg_rate)

    return jsonify({
        "inventoryHealthScore": health_score,
        "lowStockRiskCount": len(low_stock_products),
        "fastMovingCount": len(fast_moving),
        "slowMovingCount": len(slow_moving),
        "predictedOutofStockDays": predicted_days,
        "recommendations": recommendations,
        "forecast": forecast,
        "abcMatrix": abc_matrix,
    }), 200
