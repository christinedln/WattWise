from flask import Blueprint, jsonify

from utils.mapper import merge_device_data
from utils.calculations import compute_power_trend
from utils.time_helper import now_time
from utils.auth import auth_required
from flask import request

realtime_bp = Blueprint("realtime", __name__)

# ALL DEVICES
@realtime_bp.route("/devices", methods=["GET"])
@auth_required
def get_realtime_devices():
    user_id = request.user_id  

    devices = merge_device_data(user_id)

    for d in devices:
        d["message"] = d.get("alert_message")

    return jsonify(devices)

# SINGLE DEVICE
@realtime_bp.route("/device/<device_id>", methods=["GET"])
@auth_required
def get_device(device_id):
    user_id = request.user_id

    devices = merge_device_data(user_id)

    device = next((d for d in devices if d["device_id"] == device_id), None)

    if not device:
        return jsonify({"error": "Device not found"}), 404

    device["message"] = device.get("alert_message")

    return jsonify(device)

# POWER TREND
@realtime_bp.route("/power-trend/<device_id>", methods=["GET"])
@auth_required
def power_trend(device_id):
    user_id = request.user_id
    return jsonify(compute_power_trend(device_id))