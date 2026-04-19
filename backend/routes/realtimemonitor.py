from flask import Blueprint, jsonify

from utils.mapper import merge_device_data
from utils.calculations import compute_power_trend
from utils.time_helper import now_time

realtime_bp = Blueprint("realtime", __name__)

# ALL DEVICES
@realtime_bp.route("/devices", methods=["GET"])
def get_realtime_devices():
    devices = merge_device_data()

    for d in devices:
        d["message"] = d.get("alert_message")

    return jsonify(devices)

# SINGLE DEVICE
@realtime_bp.route("/device/<device_id>", methods=["GET"])
def get_device(device_id):
    devices = merge_device_data()

    device = next((d for d in devices if d["device_id"] == device_id), None)

    if not device:
        return jsonify({"error": "Device not found"}), 404

    device["message"] = device.get("alert_message")

    return jsonify(device)

# POWER TREND
@realtime_bp.route("/power-trend/<device_id>", methods=["GET"])
def power_trend(device_id):
    return jsonify(compute_power_trend(device_id))