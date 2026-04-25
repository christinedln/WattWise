from flask import Blueprint, jsonify, request
from utils.mapper import merge_device_data
from services.data_service import get_rate
from firebase_config import db

devices_bp = Blueprint("devices_bp", __name__)


# =========================
# GET ALL DEVICES (DEFAULT - LEGACY)
# =========================
@devices_bp.route("/", methods=["GET"])
def get_all_devices():
    print("\n================ ALL DEVICES REQUEST ================")

    devices = merge_device_data("test_user")  # fallback user

    print("DEVICE COUNT:", len(devices))

    return jsonify({
        "status": "success",
        "count": len(devices),
        "data": devices
    })


# =========================
# GET DEVICES BY USER (FRONTEND USES THIS)
# =========================
@devices_bp.route("/<user_id>", methods=["GET"])
def get_devices_by_user(user_id):
    print("\n================ USER DEVICE REQUEST ================")
    print("USER ID:", user_id)

    devices = merge_device_data(user_id)

    print("MERGED DEVICES COUNT:", len(devices))
    print("MERGED DEVICES:", devices)

    return jsonify({
        "status": "success",
        "count": len(devices),
        "data": devices
    })


# =========================
# PATCH DEVICE ENABLED STATE
# =========================
@devices_bp.route("/<user_id>/<device_id>", methods=["PATCH"])
def update_device(user_id, device_id):
    try:
        print("\n================ DEVICE TOGGLE REQUEST ================")
        print("USER:", user_id)
        print("DEVICE:", device_id)

        data = request.json
        enabled = data.get("enabled")

        print("NEW ENABLED VALUE:", enabled)

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

        doc_ref.update({
            "enabled": enabled
        })

        print("DEVICE UPDATED SUCCESSFULLY")

        return jsonify({
            "status": "success",
            "device_id": device_id,
            "enabled": enabled
        }), 200

    except Exception as e:
        print("UPDATE ERROR:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# =========================
# SUMMARY
# =========================
@devices_bp.route("/summary", methods=["GET"])
def device_summary():
    print("\n================ DEVICE SUMMARY ================")

    devices = merge_device_data("test_user")
    rate = get_rate()

    total_kwh = sum(d["consumption"] for d in devices)
    total_cost = round(total_kwh * rate, 2)

    print("TOTAL DEVICES:", len(devices))

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