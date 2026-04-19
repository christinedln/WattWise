from flask import Blueprint, jsonify
from utils.mapper import merge_device_data
from services.data_service import get_rate

devices_bp = Blueprint("devices_bp", __name__)


@devices_bp.route("/", methods=["GET"])
def get_devices():
    devices = merge_device_data()

    return jsonify({
        "status": "success",
        "count": len(devices),
        "data": devices
    })


@devices_bp.route("/<device_id>", methods=["GET"])
def get_device(device_id):
    devices = merge_device_data()

    device = next((d for d in devices if d["device_id"] == device_id), None)

    if not device:
        return jsonify({"status": "error", "message": "Device not found"}), 404

    return jsonify({
        "status": "success",
        "data": device
    })


@devices_bp.route("/summary", methods=["GET"])
def device_summary():
    devices = merge_device_data()
    rate = get_rate()

    total_kwh = sum(d["consumption"] for d in devices)
    total_cost = round(total_kwh * rate, 2)

    return jsonify({
        "status": "success",
        "data": {
            "total_devices": len(devices),
            "active": len([d for d in devices if d["status"] == "active"]),
            "offline": len([d for d in devices if d["status"] == "offline"]),
            "total_kwh": round(total_kwh, 2),
            "estimated_cost": total_cost
        }
    })