from flask import Blueprint, jsonify, request
from utils.mapper import merge_device_data
from services.data_service import get_rate
from firebase_config import db
from utils.auth import auth_required  

devices_bp = Blueprint("devices_bp", __name__)

@devices_bp.route("/", methods=["GET"])
@auth_required
def get_all_devices():
    user_id = request.user_id

    devices = merge_device_data(user_id)

    return jsonify({
        "status": "success",
        "count": len(devices),
        "data": devices
    })

@devices_bp.route("/devices", methods=["GET"])
@auth_required
def get_devices_by_user():
    user_id = request.user_id

    devices = merge_device_data(user_id)

    return jsonify({
        "status": "success",
        "count": len(devices),
        "data": devices
    })


@devices_bp.route("/<device_id>", methods=["PATCH"])
@auth_required
def update_device(device_id):
    try:
        user_id = request.user_id
        data = request.json
        enabled = data.get("enabled")

        if enabled is None:
            return jsonify({
                "status": "error",
                "message": "Missing 'enabled' field"
            }), 400

        doc_ref = (
            db.collection("devices")
              .document(user_id)
              .collection("user_devices")
              .document(device_id)
        )

        doc_ref.update({"enabled": enabled})

        return jsonify({
            "status": "success",
            "device_id": device_id,
            "enabled": enabled
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@devices_bp.route("/summary", methods=["GET"])
@auth_required
def device_summary():
    user_id = request.user_id

    devices = merge_device_data(user_id)
    rate = get_rate(user_id)

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