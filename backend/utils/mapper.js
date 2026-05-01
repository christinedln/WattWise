// utils/mapper
const { getDevices, getRealtimeLogs } = require("../services/data_service");
const { generateCurrentAlerts } = require("./generateCurrentAlerts");
const { generateVoltageAlerts } = require("./generateVoltageAlerts");
const { generatePowerAlerts } = require("./generatePowerAlerts");
const { nowTime } = require("../utils/time_helper");
const { calcKwh } = require("../utils/calculations");

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

        const settings = d.settings || {};

        // RAW LOGS
        const logWindow = settings.log_window;

        const logsRaw = await getRealtimeLogs(
            userId,
            deviceId,
            logWindow
        );
        const realtimeLogs = Array.isArray(logsRaw) ? logsRaw : [];

        // SIGNAL-SPECIFIC MAPPING
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

        // CURRENT ALERT ENGINE ONLY
        const currentAlerts = generateCurrentAlerts([
            {
                device_id: deviceId,
                name: d.name,
                settings,
                logs: structuredLogs.current
            }
        ]);

        const voltageAlerts = generateVoltageAlerts
            ? generateVoltageAlerts([
                {
                    device_id: deviceId,
                    name: d.name,
                    settings,
                    logs: structuredLogs.voltage
                }
            ])
            : [];

        const powerAlerts = generatePowerAlerts
            ? generatePowerAlerts([
                {
                    device_id: deviceId,
                    name: d.name,
                    settings,
                    logs: structuredLogs.power
                }
            ])
            : [];

        // merge everything
        const alerts = [
                ...currentAlerts.map(a => ({ ...a, signal: "current" })),
                ...voltageAlerts.map(a => ({ ...a, signal: "voltage" })),
                ...powerAlerts.map(a => ({ ...a, signal: "power" }))
            ];

            if (alerts.length === 0) {
                alerts.push({
                    signal: "all",
                    severity: "Normal",
                    message: "No issues detected"
                });
            }
        
        // FINAL MERGED DEVICE OBJECT
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

            signal: "current",

            status: d.status === "ON" ? "active" : "offline",
            enabled: d.enabled ?? true,

            alerts,

            consumption: calcKwh(d.power, d.runtime || 0),

            lastUpdated: nowTime(),

            realtime_logs: structuredLogs,

            settings
        });
    }

    return merged;
}

module.exports = {
    mergeDeviceData
};