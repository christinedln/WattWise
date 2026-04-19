def generate_alerts(devices):
    alerts = []

    for d in devices:

        # OFFLINE
        if d["status"] == "OFF":
            alerts.append({
                "device_id": d["device_id"],
                "health": "Offline",
                "message": "Device not responding",
                "severity": "Offline"
            })
            continue

        # OVERLOAD (CRITICAL)
        if d["power"] > 1000:
            alerts.append({
                "device_id": d["device_id"],
                "health": "Critical",
                "message": "Power overload detected",
                "severity": "Critical"
            })

        # SUSPICIOUS PATTERN
        elif d["power"] > 700:
            alerts.append({
                "device_id": d["device_id"],
                "health": "Suspicious",
                "message": "Irregular usage detected",
                "severity": "Suspicious"
            })

        # WARNING
        elif d["power"] > 250:
            alerts.append({
                "device_id": d["device_id"],
                "health": "Warning",
                "message": "Elevated usage detected",
                "severity": "Warning"
            })

        # VOLTAGE / CURRENT WARNINGS
        if d["current"] > 10:
            alerts.append({
                "device_id": d["device_id"],
                "health": "Warning",
                "message": "High current detected",
                "severity": "Warning"
            })

        if d["voltage"] > 240:
            alerts.append({
                "device_id": d["device_id"],
                "health": "Warning",
                "message": "High voltage detected",
                "severity": "Warning"
            })

        # NORMAL CASE
        if d["power"] <= 250 and d["voltage"] <= 240 and d["current"] <= 10:
            alerts.append({
                "device_id": d["device_id"],
                "health": "Normal",
                "message": "No issues detected",
                "severity": "Normal"
            })

    return alerts