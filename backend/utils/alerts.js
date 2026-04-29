const { getRegistry } = require("../services/data_service");

function generateAlerts(devices, settings) {
    const groupedAlerts = {};

    const level = settings?.security_alert_level ?? 3;
    const energyLimit = settings?.energy_alert_threshold ?? 5000;

    console.log("\n--- ALERT ENGINE DEBUG ---");
    console.log("Security Level:", level);
    console.log("Energy Threshold:", energyLimit);

    let currentLimit;
    let voltageLimit;

    if (level === 1) {
        currentLimit = 15;
        voltageLimit = 260;
    } else if (level === 2) {
        currentLimit = 12;
        voltageLimit = 250;
    } else {
        currentLimit = 10;
        voltageLimit = 240;
    }

    const registry = getRegistry();

    for (const d of devices) {

        if (d.enabled === false) continue;

        console.log("\nDEVICE CHECK:", d);

        const deviceId = String(d.device_id);
        const deviceName = d.name || "Unknown";

        if (!groupedAlerts[deviceId]) {
            groupedAlerts[deviceId] = {
                device_id: deviceId,
                name: deviceName,
                alerts: []
            };
        }

        const alerts = groupedAlerts[deviceId].alerts;

        let hasIssue = false;

        // ENERGY
        if (d.power >= energyLimit) {
            console.log("ENERGY ALERT TRIGGERED");
            alerts.push({
                health: "Critical",
                message: "Energy threshold exceeded"
            });
            hasIssue = true;
        }

        // CURRENT
        if (d.current > currentLimit) {
            console.log("⚠ CURRENT ALERT");
            alerts.push({
                health: "Warning",
                message: "High current detected"
            });
            hasIssue = true;
        }

        // VOLTAGE
        if (d.voltage > voltageLimit) {
            console.log("⚠ VOLTAGE ALERT");
            alerts.push({
                health: "Warning",
                message: "High voltage detected"
            });
            hasIssue = true;
        }

        // NORMAL
        if (!hasIssue) {
            alerts.push({
                health: "Normal",
                message: "No issues detected"
            });
        }
    }

    // flatten alerts
    const flat = [];

    Object.values(groupedAlerts).forEach(device => {
        device.alerts.forEach(a => {
            flat.push({
                device_id: device.device_id,
                device_name: device.name,
                severity: a.health,
                message: a.message
            });
        });
    });


    return flat;
}

module.exports = {
    generateAlerts
};