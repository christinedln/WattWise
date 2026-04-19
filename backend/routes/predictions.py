from flask import Blueprint, jsonify
from utils.mapper import merge_device_data
from services.data_service import get_rate
from datetime import date, timedelta

predictions_bp = Blueprint("predictions", __name__)


@predictions_bp.route("/summary")
def summary():
    devices = merge_device_data()
    rate    = get_rate()

    # ── Base rate from current consumption ────────────────────────────────────
    total_consumption   = sum(d["consumption"] for d in devices)
    total_runtime_hours = sum(d["runtime"] for d in devices) / 3600 or 1
    kwh_per_hour        = total_consumption / total_runtime_hours
    daily_kwh           = round(kwh_per_hour * 24, 4)

    weekly_kwh   = round(daily_kwh * 7,  4)
    monthly_kwh  = round(daily_kwh * 30, 4)
    weekly_cost  = round(weekly_kwh  * rate, 2)
    monthly_cost = round(monthly_kwh * rate, 2)

    # ── Daily forecast (next 7 days, flat moving average) ─────────────────────
    today = date.today()
    daily_forecast = [
        {
            "date":        (today + timedelta(days=i)).strftime("%b %d"),
            "consumption": daily_kwh,
            "cost":        round(daily_kwh * rate, 2),
        }
        for i in range(7)
    ]

    # ── Actual vs predicted (last 7 days simulated) ───────────────────────────
    actual_vs_predicted = [
        {
            "date":      (today - timedelta(days=6 - i)).strftime("%b %d"),
            "actual":    round(daily_kwh * (0.95 + 0.01 * i), 4),
            "predicted": daily_kwh,
        }
        for i in range(7)
    ]

    # ── Per device ────────────────────────────────────────────────────────────
    per_device = {}
    for d in devices:
        d_runtime_hours = d["runtime"] / 3600 or 1
        d_kwh_per_hour  = d["consumption"] / d_runtime_hours
        d_daily_kwh     = round(d_kwh_per_hour * 24, 4)
        d_w_kwh         = round(d_daily_kwh * 7,  4)
        d_m_kwh         = round(d_daily_kwh * 30, 4)
        per_device[d["device_id"]] = {
            "name":         d["name"],
            "weekly_kwh":   d_w_kwh,
            "weekly_cost":  round(d_w_kwh * rate, 2),
            "monthly_kwh":  d_m_kwh,
            "monthly_cost": round(d_m_kwh * rate, 2),
        }

    return jsonify({
        "weekly_predicted_kwh":    weekly_kwh,
        "weekly_predicted_cost":   weekly_cost,
        "monthly_predicted_kwh":   monthly_kwh,
        "monthly_predicted_cost":  monthly_cost,
        "rate_per_kwh":            rate,
        "daily_forecast":          daily_forecast,
        "actual_vs_predicted":     actual_vs_predicted,
        "per_device":              per_device,
    })