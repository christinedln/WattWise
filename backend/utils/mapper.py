# utils/mapper.py

from services.data_service import get_devices, get_registry
from utils.alerts import generate_alerts
from utils.time_helper import now_time
from services.settings_service import get_user_settings

def merge_device_data(user_id):
    devices = get_devices(user_id)
    registry = get_registry()

    settings = get_user_settings(user_id) or {}
    alerts = generate_alerts(devices, settings or {})

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
        device_id = d.get("device_id") or d.get("id")
        meta = registry.get(str(device_id), {})

        # ── FIND DEVICE ALERT GROUP ──
        device_group = next(
            (a for a in alerts if a.get("device_id") == device_id),
            None
        )

        # ── DETERMINE HEALTH + MESSAGE ──
        if device_group and device_group.get("alerts"):
            best = max(
                device_group["alerts"],
                key=lambda x: priority.get(x.get("health", "Normal"), 0)
            )
            health = best.get("health", "Normal")
            message = best.get("message", "No issues detected")
        else:
            health = "Normal"
            message = "No issues detected"

        # ── ACTIVITY TIMELINE ──
        timeline = [
            {
                "time": now_time(),
                "event": "Device checked"
            }
        ]

        if d.get("status") == "ON":
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

        # ── FINAL MERGED DEVICE OBJECT ──
        merged.append({
            "id": f"device-{device_id}",
            "device_id": device_id,

            "name": d.get("name", f"Device {device_id}"),
            "location": d.get("location", "Unknown"),
            "type": d.get("type", "Unknown"),

            "voltage": d.get("voltage", 0),
            "current": d.get("current", 0),
            "power": d.get("power", 0),
            "runtime": d.get("runtime", 0),

            "status": "active" if d.get("status") == "ON" else "offline",

            "enabled": d.get("enabled", True),

            "health": health,
            "alert_message": message,

            "consumption": round((d.get("power", 0) * d.get("runtime", 0)) / 1000, 2),

            "lastUpdated": now_time(),

            "activity_timeline": timeline,
        })

    return merged