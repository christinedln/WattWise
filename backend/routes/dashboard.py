from flask import Blueprint, jsonify

from services.data_service import get_devices, get_rate
from utils.mapper import merge_device_data
from utils.calculations import calc_kwh
from firebase_config import db

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/summary")
def summary():

    # ── SINGLE SOURCE OF TRUTH ─────────────
    user_id = "test_user"
    enriched_devices = merge_device_data(user_id)
    devices = [d for d in get_devices(user_id) if d.get("enabled", True)]
    rate_per_kwh = get_rate(user_id)

    # ── STATS ──────────────────────────────
    active_count = sum(1 for d in enriched_devices if d["status"] == "active")

    # ── ENERGY TOTAL ───────────────────────
    total_energy_kwh = round(
        sum(calc_kwh(d["power"], d.get("runtime", 0)) for d in devices),
        4
    )

    grand_total = total_energy_kwh or 1

    # ── DEVICE BREAKDOWN (USE MAPPER DATA) ─
    device_consumption = [
        {
            "device_id": d["device_id"],
            "name": d["name"],

            "kwh": calc_kwh(
                next((x["power"] for x in devices if x["device_id"] == d["device_id"]), 0),
                next((x.get("runtime", 0) for x in devices if x["device_id"] == d["device_id"]), 0),
            ),

            "percent_of_total": round(
                calc_kwh(
                    next((x["power"] for x in devices if x["device_id"] == d["device_id"]), 0),
                    next((x.get("runtime", 0) for x in devices if x["device_id"] == d["device_id"]), 0),
                ) / grand_total * 100,
                1
            ),

            "voltage": d["voltage"],
            "current": d["current"],
            "power": d["power"],
            "status": d["status"],
        }
        for d in enriched_devices
    ]

    # ── PREDICTIONS ───────────────────────
    total_consumption   = sum(d["consumption"] for d in enriched_devices)
    total_runtime_hours = max(sum(d.get("runtime", 0) for d in devices) / 3600, 1)
    kwh_per_hour        = total_consumption / total_runtime_hours
    daily_kwh           = round(kwh_per_hour * 24, 4)

    weekly_kwh   = round(daily_kwh * 7,  4)
    monthly_kwh  = round(daily_kwh * 30, 4)
    weekly_cost  = round(weekly_kwh  * rate_per_kwh, 2)
    monthly_cost = round(monthly_kwh * rate_per_kwh, 2)

    return jsonify({
        "active_devices":  active_count,
        "total_devices":   len(devices),

        "live_readings":       enriched_devices,
        "device_consumption":  device_consumption,

        "total_energy_kwh":       total_energy_kwh,
        "weekly_predicted_kwh":   weekly_kwh,
        "weekly_predicted_cost":  weekly_cost,
        "monthly_predicted_kwh":  monthly_kwh,
        "monthly_predicted_cost": monthly_cost,

        "rate_per_kwh": rate_per_kwh,
    })
