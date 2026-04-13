import json
import os
from flask import Blueprint, jsonify

dashboard_bp = Blueprint("dashboard", __name__)

# ── Load mock data ────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)

def load_mock():
    with open(os.path.join(BASE_DIR, "mock_data.json"), "r") as f:
        return json.load(f)


# ── Helpers ───────────────────────────────────────────────────────────────────

def calc_kwh(power_w, runtime_seconds):
    """Convert watts + runtime seconds → kWh"""
    return round((power_w * runtime_seconds) / 3600 / 1000, 4)


# ── Route ─────────────────────────────────────────────────────────────────────

@dashboard_bp.route("/summary")
def summary():
    data     = load_mock()
    devices  = data["devices"]
    alerts   = data["alerts"]
    rate     = data["rate_per_kwh"]

    # ── 1. Active devices count ───────────────────────────────────────────────
    active_count   = sum(1 for d in devices if d["last_reading"]["status"] == "ON")

    # ── 2. Critical alerts count ──────────────────────────────────────────────
    critical_count = sum(1 for a in alerts if a["severity"] == "Critical")

    # ── 3. Live readings (voltage, current, power per device) ─────────────────
    live_readings = [
        {
            "device_id": d["device_id"],
            "name":      d["name"],
            "voltage":   d["last_reading"]["voltage"],
            "current":   d["last_reading"]["current"],
            "power":     d["last_reading"]["power"],
            "status":    d["last_reading"]["status"],
            "runtime":   d["last_reading"]["runtime"],
        }
        for d in devices
    ]

    # ── 4. Total energy consumption (sum of all devices kWh) ──────────────────
    total_energy_kwh = round(
        sum(
            calc_kwh(d["last_reading"]["power"], d["last_reading"]["runtime"])
            for d in devices
        ),
        4,
    )

    # ── 5. Weekly / monthly predicted cost ────────────────────────────────────
    # Based on total_energy_kwh as current usage rate
    # Extrapolate: avg kWh per second → project to 7 days and 30 days
    total_runtime_seconds = sum(d["last_reading"]["runtime"] for d in devices) or 1
    kwh_per_second        = total_energy_kwh / total_runtime_seconds

    seconds_in_week  = 7  * 24 * 3600
    seconds_in_month = 30 * 24 * 3600

    weekly_kwh   = round(kwh_per_second  * seconds_in_week,  4)
    monthly_kwh  = round(kwh_per_second  * seconds_in_month, 4)
    weekly_cost  = round(weekly_kwh  * rate, 2)
    monthly_cost = round(monthly_kwh * rate, 2)

    # ── 6. Device consumption (each device's kWh + % of total) ────────────────
    grand_total = total_energy_kwh or 1  # avoid division by zero

    device_consumption = [
        {
            "device_id":        d["device_id"],
            "name":             d["name"],
            "status":           d["last_reading"]["status"],
            "kwh":              calc_kwh(
                                    d["last_reading"]["power"],
                                    d["last_reading"]["runtime"]
                                ),
            "percent_of_total": round(
                                    calc_kwh(
                                        d["last_reading"]["power"],
                                        d["last_reading"]["runtime"]
                                    ) / grand_total * 100,
                                    1,
                                ),
            "voltage":          d["last_reading"]["voltage"],
            "current":          d["last_reading"]["current"],
            "power":            d["last_reading"]["power"],
        }
        for d in devices
    ]

    return jsonify({
        # Stat cards
        "active_devices":          active_count,
        "total_devices":           len(devices),
        "critical_alerts":         critical_count,
        "total_alerts":            len(alerts),

        # Live readings table
        "live_readings":           live_readings,

        # Total energy card
        "total_energy_kwh":        total_energy_kwh,

        # Cost prediction cards
        "weekly_predicted_kwh":    weekly_kwh,
        "weekly_predicted_cost":   weekly_cost,
        "monthly_predicted_kwh":   monthly_kwh,
        "monthly_predicted_cost":  monthly_cost,
        "rate_per_kwh":            rate,

        # Device consumption list
        "device_consumption":      device_consumption,

        # Recent alerts strip
        "recent_alerts":           alerts[:3],
    })