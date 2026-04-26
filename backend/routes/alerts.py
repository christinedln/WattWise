from flask import Blueprint, jsonify, request
from services.data_service import get_devices
from services.settings_service import get_user_settings
from utils.alerts import generate_alerts
from utils.auth import auth_required

alerts_bp = Blueprint("alerts", __name__)

@alerts_bp.route("", methods=["GET"])
@auth_required
def get_alerts():
    user_id = request.user_id

    devices = get_devices(user_id)
    settings = get_user_settings(user_id)

    alerts = generate_alerts(devices, settings)

    return jsonify(alerts)