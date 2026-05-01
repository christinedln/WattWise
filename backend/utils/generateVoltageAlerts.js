function generateVoltageAlerts(devices) {
    if (!Array.isArray(devices)) return [];

    const severityRank = {
        Normal: 0,
        Warning: 1,
        Suspicious: 2,
        Critical: 3
    };

    const grouped = {};

    for (const d of devices) {

        const deviceId = String(d.device_id);
        const logs = Array.isArray(d.logs) ? d.logs : [];
        const settings = d.settings || {};

        const TRAINING_SIZE = settings.log_window ?? 10;

        const warning = settings.voltage_warning_threshold ?? 1.5;
        const suspicious = settings.voltage_suspicious_threshold ?? 2.0;
        const critical = settings.voltage_critical_threshold ?? 2.6;

        grouped[deviceId] = {
            device_id: deviceId,
            name: d.name || "Unknown Device",
            alerts: []
        };

        const values = logs
            .map(x => x.value)
            .filter(v => typeof v === "number");

        if (values.length < TRAINING_SIZE + 1) continue;

        const training = values.slice(0, TRAINING_SIZE);

        const mean =
            training.reduce((a, b) => a + b, 0) / training.length;

        const std =
            Math.sqrt(
                training.reduce((s, x) => s + Math.pow(x - mean, 2), 0) /
                training.length
            );

        const x = values[values.length - 1];

        const eps = 1e-6;
        const z = (x - mean) / (std + eps);

        let severity = "Normal";
        let message = "No anomaly detected";

        if (Math.abs(z) >= critical) {
            severity = "Critical";
            message = "Critical anomaly detected";
        } else if (Math.abs(z) >= suspicious) {
            severity = "Suspicious";
            message = "Suspicious anomaly detected";
        } else if (Math.abs(z) >= warning) {
            severity = "Warning";
            message = "Warning deviation detected";
        }

        grouped[deviceId].alerts.push({ severity, message });
    }

    return Object.values(grouped).map(d => {

        if (!d.alerts || d.alerts.length === 0) {
            return {
                device_id: d.device_id,
                device_name: d.name,
                severity: "Normal",
                message: "No anomaly detected"
            };
        }

        const final = d.alerts.reduce((best, cur) =>
            severityRank[cur.severity] > severityRank[best.severity] ? cur : best
        );

        return {
            device_id: d.device_id,
            device_name: d.name,
            severity: final.severity,
            message: final.message
        };
    });
}

module.exports = {
    generateVoltageAlerts
};