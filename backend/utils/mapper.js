const { getDevices, getRegistry } = require("../services/data_service");
const { generateAlerts } = require("../utils/alerts");
const { getUserSettings } = require("../services/settings_service");
const { nowTime } = require("../utils/time_helper"); // assumed JS version

async function mergeDeviceData(userId) {
    const devices = await getDevices(userId) || [];
    const registry = await getRegistry() || {};
    const settings = (await getUserSettings(userId)) || {};

    const alerts = generateAlerts(devices, settings);

    const merged = [];

    // severity priority
    const priority = {
        Critical: 4,
        Suspicious: 3,
        Warning: 2,
        Normal: 1,
        Offline: 0
    };

    for (const d of devices) {
        const deviceId = d.device_id || d.id;
        const meta = registry[String(deviceId)] || {};

        // ── FIND DEVICE ALERT GROUP ──
        const deviceGroup = alerts.find(
            a => a.device_id == deviceId
        );

        // ── DETERMINE HEALTH + MESSAGE ──
        let health = "Normal";
        let message = "No issues detected";

        if (deviceGroup && deviceGroup.alerts?.length) {
            const best = deviceGroup.alerts.reduce((prev, curr) => {
                const prevP = priority[prev?.health] || 0;
                const currP = priority[curr?.health] || 0;
                return currP > prevP ? curr : prev;
            });

            health = best?.health || "Normal";
            message = best?.message || "No issues detected";
        }

        // ── ACTIVITY TIMELINE ──
        const timeline = [
            {
                time: nowTime(),
                event: "Device checked"
            }
        ];

        if (d.status === "ON") {
            timeline.push({
                time: nowTime(),
                event: "Device active"
            });
        } else {
            timeline.push({
                time: nowTime(),
                event: "Device offline"
            });
        }

        if (health === "Critical") {
            timeline.push({
                time: nowTime(),
                event: "Critical condition detected"
            });
        } else if (health === "Warning") {
            timeline.push({
                time: nowTime(),
                event: "Warning condition detected"
            });
        }

        // ── FINAL MERGED DEVICE OBJECT ──
        merged.push({
            id: `device-${deviceId}`,
            device_id: deviceId,

            name: d.name || `Device ${deviceId}`,
            location: d.location || "Unknown",
            type: d.type || "Unknown",

            voltage: d.voltage || 0,
            current: d.current || 0,
            power: d.power || 0,
            runtime: d.runtime || 0,

            status: d.status === "ON" ? "active" : "offline",

            enabled: d.enabled ?? true,

            health,
            alert_message: message,

            consumption: Number(
                ((d.power || 0) * (d.runtime || 0)) / 1000
            ).toFixed(2),

            lastUpdated: nowTime(),

            activity_timeline: timeline
        });
    }

    return merged;
}

module.exports = {
    mergeDeviceData
};