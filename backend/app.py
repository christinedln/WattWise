from flask import Flask
from flask_cors import CORS
from dashboard import dashboard_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

@app.route("/api/health")
def health():
    return {"status": "ok", "message": "WattWise API running"}

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)