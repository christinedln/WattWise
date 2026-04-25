from flask import Blueprint, jsonify
from services.data_service import get_devices
from services.settings_service import get_user_settings
from utils.alerts import generate_alerts

alerts_bp = Blueprint("alerts", __name__)

@alerts_bp.route("/<user_id>")
def get_alerts(user_id):

    print("\n================ ALERT DEBUG START ================")

    devices = get_devices(user_id)
    settings = get_user_settings(user_id)

    print("USER ID:", user_id)
    print("SETTINGS:", settings)
    print("DEVICES:", devices)

    alerts = generate_alerts(devices, settings)

    print("FINAL ALERT OUTPUT:", alerts)
    print("TOTAL ALERTS:", len(alerts))
    print("================ ALERT DEBUG END ===============\n")

    return jsonify(alerts)