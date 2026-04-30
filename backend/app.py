from flask import Flask
from flask_cors import CORS
from routes.dashboard import dashboard_bp 
from routes.devices import devices_bp
from routes.realtimemonitor import realtime_bp 
from routes.predictions import predictions_bp
from routes.adminAccounts import admin_accounts_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
app.register_blueprint(devices_bp, url_prefix="/api/devices")
app.register_blueprint(realtime_bp, url_prefix="/api/realtime")

@app.route("/api/health")
def health():
    return {
        "status": "ok",
        "message": "WattWise API running"
    }

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)