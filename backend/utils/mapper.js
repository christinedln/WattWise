// utils/mapper
const { getDevices, getRealtimeLogs, getAlerts, getCurrentAlerts } = require("../services/data_service");
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

        const settings = d.settings || {};

        const logWindow = settings.log_window;

        const logsRaw = await getRealtimeLogs(
            userId,
            deviceId,
            logWindow
        );

        const realtimeLogs = Array.isArray(logsRaw) ? logsRaw : [];

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

        const rawAlerts = await getAlerts(userId, deviceId);
        const alertsArray = Array.isArray(rawAlerts) ? rawAlerts : [];

        const alerts = alertsArray.map(a => ({
            signal: a.signal || "unknown",
            severity: a.severity || "normal",
            message: a.message || `${a.severity || "normal"} anomaly detected`,
            timestamp: a.timestamp,
            resolved: a.resolved ?? false,
        }));

        const rawCurrentAlerts = await getCurrentAlerts(userId, deviceId);

        const currentalert = Array.isArray(rawCurrentAlerts)
            ? rawCurrentAlerts.map(a => ({
                id: a.id,
                signal: a.signal,
                severity: (a.severity || "normal").toLowerCase(),
                timestamp: a.timestamp || null,
            }))
            : [];
            
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
            
            currentalert,

            consumption: Number(d.consumption) || 0,

            lastUpdated: nowTime(),
            
            settings
        });
    }

    return merged;
}

module.exports = {
    mergeDeviceData
};