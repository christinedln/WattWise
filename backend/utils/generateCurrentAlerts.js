function generateCurrentAlerts(devices) {

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

        grouped[deviceId] = {
            device_id: deviceId,
            name: d.name || "Unknown Device",
            alerts: []
        };

        if (logs.length === 0) continue;

        // extract values from structured logs
        const I = logs.map(x =>
            typeof x.value === "number" ? x.value : 0
        );

        const mean =
            I.length > 0
                ? I.reduce((a, b) => a + b, 0) / I.length
                : 0;

        const std =
            I.length > 0
                ? Math.sqrt(
                    I.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / I.length
                )
                : 0;

        const z = (x) => std === 0 ? 0 : (x - mean) / std;

        let bestSeverity = "Normal";
        let bestMessage = "System stable";

        for (const log of logs) {

            const i = typeof log.value === "number" ? log.value : 0;  
            const zi = Math.abs(z(i));

            let severity = "Normal";
            let message = "";

            if (zi >= 3.5) {
                severity = "Critical";
                message = `Current critical anomaly`;
            } 
            else if (zi >= 2.5) {
                severity = "Suspicious";
                message = `Current suspicious deviation`;
            } 
            else if (zi >= 2.0) {
                severity = "Warning";
                message = `Current warning deviation`;
            }

            if (severityRank[severity] > severityRank[bestSeverity]) {
                bestSeverity = severity;
                bestMessage = message;
            }
        }

        grouped[deviceId].alerts.push({
            severity: bestSeverity,
            message: bestMessage
        });
    }

    // flatten
    const flat = [];

    Object.values(grouped).forEach(d => {
        d.alerts.forEach(a => {
            flat.push({
                device_id: d.device_id,
                device_name: d.name,
                severity: a.severity,
                message: a.message
            });
        });
    });

    return flat;
}

module.exports = {
    generateCurrentAlerts
};