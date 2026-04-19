#utils/mapper.py
from services.data_service import get_devices, get_registry
from utils.alerts import generate_alerts
from utils.time_helper import now_time
import random

def merge_device_data():
    devices = get_devices()
    registry = get_registry()

    alerts = generate_alerts(devices)

    merged = []

    # severity priority
    priority = {
        "Critical": 4,
        "Suspicious": 3,
        "Warning": 2,
        "Normal": 1,
        "Offline": 0
    }

    for d in devices:
        device_id = d["device_id"]
        meta = registry.get(device_id, {})

        device_alerts = [a for a in alerts if a["device_id"] == device_id]

        # ── HEALTH + MESSAGE (FROM ALERT ENGINE ONLY) ──
        if device_alerts:
            best = max(device_alerts, key=lambda x: priority.get(x.get("health", "Normal"), 0))
            health = best.get("health", "Normal")
            message = best.get("message", "No issues detected")
        else:
            health = "Normal"
            message = "No issues detected"

                # ── ACTIVITY TIMELINE (SIMULATED / TEMPORARY) ──
        timeline = [
            {
                "time": now_time(),
                "event": "Device checked"
            }
        ]

        # add behavior-based event
        if d["status"] == "ON":
            timeline.append({
                "time": now_time(),
                "event": "Device active"
            })
        else:
            timeline.append({
                "time": now_time(),
                "event": "Device offline"
            })

        if health == "Critical":
            timeline.append({
                "time": now_time(),
                "event": "Critical condition detected"
            })
        elif health == "Warning":
            timeline.append({
                "time": now_time(),
                "event": "Warning condition detected"
            })

        merged.append({
            "id": f"device-{device_id}",
            "device_id": device_id,

            "name": meta.get("name", f"Device {device_id}"),
            "type": meta.get("type", "Unknown"),
            "location": meta.get("location", "Unknown"),

            "voltage": d["voltage"],
            "current": d["current"],
            "power": d["power"],
            "runtime": d["runtime"],

            "status": "active" if d["status"] == "ON" else "offline",

            "health": health,
            "alert_message": message,   

            "consumption": round((d["power"] * d["runtime"]) / 1000, 2),

            "lastUpdated": now_time(),

            "activity_timeline": timeline,
        })

    return merged