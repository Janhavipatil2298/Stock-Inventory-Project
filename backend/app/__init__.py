from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, jwt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}}, supports_credentials=True)

    # ---- Blueprints ----
    from app.routes.auth_routes import auth_bp
    from app.routes.product_routes import product_bp
    from app.routes.catalog_routes import catalog_bp
    from app.routes.sales_routes import sales_bp
    from app.routes.purchase_routes import purchase_bp
    from app.routes.warehouse_routes import warehouse_bp, movement_bp
    from app.routes.misc_routes import notification_bp, config_bp
    from app.routes.employee_routes import employee_bp, leave_bp, attendance_bp
    from app.routes.dashboard_routes import dashboard_bp

    for bp in (auth_bp, product_bp, catalog_bp, sales_bp, purchase_bp, warehouse_bp,
               movement_bp, notification_bp, config_bp, employee_bp, leave_bp,
               attendance_bp, dashboard_bp):
        app.register_blueprint(bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # ---- JWT error handlers ----
    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify({"error": "Missing or invalid authorization token"}), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"error": "Invalid token"}), 422

    @jwt.expired_token_loader
    def expired_token(header, payload):
        return jsonify({"error": "Token has expired, please log in again"}), 401

    return app
