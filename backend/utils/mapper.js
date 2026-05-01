const { getDevices, getRealtimeLogs } = require("../services/data_service");
const { generateCurrentAlerts } = require("./generateCurrentAlerts");
const { nowTime } = require("../utils/time_helper");

async function mergeDeviceData(userId) {
    if (!userId || typeof userId !== "string") return [];
    const rawDevices = await getDevices(userId);
    const devices = Array.isArray(rawDevices) ? rawDevices : [];

    const merged = [];

    for (const d of devices) {
        const deviceId =
            typeof d.device_id === "string"
                ? d.device_id
                : typeof d.id === "string"
                    ? d.id
                    : null;

        if (!deviceId) continue;

        // RAW LOGS
        const logsRaw = await getRealtimeLogs(userId, deviceId, 10);
        const realtimeLogs = Array.isArray(logsRaw) ? logsRaw : [];

        // ==============================
        // SIGNAL-SPECIFIC MAPPING
        // ==============================
        const structuredLogs = {
            current: realtimeLogs.map(log => ({
                value: log.current ?? 0,
                timestamp: log.timestamp,
                signal: "current"
            })),

            voltage: realtimeLogs.map(log => ({
                value: log.voltage ?? 0,
                timestamp: log.timestamp,
                signal: "voltage"
            })),

            power: realtimeLogs.map(log => ({
                value: log.power ?? 0,
                timestamp: log.timestamp,
                signal: "power"
            }))
        };

        d.realtime_logs = structuredLogs;

        // ==============================
        // CURRENT ALERT ENGINE ONLY
        // ==============================
        const alerts = generateCurrentAlerts([{
            ...d,
            signal_type: "current",
            logs: structuredLogs.current
        }]);

        const deviceAlert = alerts[0];

        const severity = deviceAlert?.severity || "Normal";
        const message = deviceAlert?.message || "No issues detected";

        // ==============================
        // TIMELINE
        // ==============================
        const timeline = [
            { time: nowTime(), event: "Device checked" },
            {
                time: nowTime(),
                event: d.status === "ON"
                    ? "Device active"
                    : "Device offline"
            }
        ];

        if (severity === "Critical") {
            timeline.push({ time: nowTime(), event: "Current critical condition detected" });
        } else if (severity === "Suspicious") {
            timeline.push({ time: nowTime(), event: "Current suspicious condition detected" });
        } else if (severity === "Warning") {
            timeline.push({ time: nowTime(), event: "Current warning condition detected" });
        }

        // ==============================
        // FINAL MERGED DEVICE OBJECT
        // ==============================
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

            // IMPORTANT: signal context
            signal: "current",

            status: d.status === "ON" ? "active" : "offline",
            enabled: d.enabled ?? true,

            severity,
            alert_message: message,

            consumption: Number(
                ((d.power || 0) * (d.runtime || 0)) / 3600000
            ).toFixed(2),

            lastUpdated: nowTime(),

            activity_timeline: timeline,

            realtime_logs: structuredLogs
        });
    }

    return merged;
}

module.exports = {
    mergeDeviceData
};