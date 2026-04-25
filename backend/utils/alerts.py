from services.data_service import get_registry

def generate_alerts(devices, settings):

    grouped_alerts = {}

    level = settings.get("security_alert_level", 3)
    energy_limit = settings.get("energy_alert_threshold", 5000)

    print("\n--- ALERT ENGINE DEBUG ---")
    print("Security Level:", level)
    print("Energy Threshold:", energy_limit)

    if level == 1:
        current_limit = 15
        voltage_limit = 260
    elif level == 2:
        current_limit = 12
        voltage_limit = 250
    else:
        current_limit = 10
        voltage_limit = 240

    registry = get_registry()

    for d in devices:

        if not d.get("enabled", True):
            continue
        
        print("\nDEVICE CHECK:", d)

        device_id = str(d["device_id"])
        device_name = d.get("name", "Unknown")

        if device_id not in grouped_alerts:
            grouped_alerts[device_id] = {
                "device_id": device_id,
                "name": device_name,
                "alerts": []
            }

        alerts = grouped_alerts[device_id]["alerts"]

        has_issue = False

    # ENERGY
        if d["power"] >= energy_limit:
            print("ENERGY ALERT TRIGGERED")
            alerts.append({
                "health": "Critical",
                "message": "Energy threshold exceeded"
            })
            has_issue = True

    # CURRENT
        if d["current"] > current_limit:
            print("⚠ CURRENT ALERT")
            alerts.append({
                "health": "Warning",
                "message": "High current detected"
            })
            has_issue = True

    # VOLTAGE
        if d["voltage"] > voltage_limit:
            print("⚠ VOLTAGE ALERT")
            alerts.append({
                "health": "Warning",
                "message": "High voltage detected"
            })
            has_issue = True

    # NORMAL
        if not has_issue:
            alerts.append({
                "health": "Normal",
                "message": "No issues detected"
            })

    # flatten
    flat = []

    for device in grouped_alerts.values():
        for a in device["alerts"]:
            flat.append({
                "device_id": device["device_id"],
                "device_name": device["name"],
                "severity": a["health"],
                "message": a["message"]
            })

    print("\nFINAL FLAT ALERTS:", flat)

    return flat