const { db } = require("../firebase_config");

// in-memory throttle tracker
const lastLogTime = new Map();

/**
 * Check if we should log based on 10-minute interval
 */
function shouldLog(userId, intervalMs = 10 * 60 * 1000) {
    const now = Date.now();
    const last = lastLogTime.get(userId);

    if (!last || now - last >= intervalMs) {
        lastLogTime.set(userId, now);
        return true;
    }

    return false;
}

/**
 * Logs snapshot data into Firestore
 */
async function logEnergySnapshot(userId, devices) {
    // 10-minute throttle per user
    if (!shouldLog(userId)) return;

    if (!devices || devices.length === 0) return;

    const logsRef = db
        .collection("energy_logs")
        .doc(userId)
        .collection("logs");

    const batch = db.batch();

    // FIXED: ensure timestamp is consistent ISO string
    const timestamp = new Date().toISOString();

    devices.forEach((d) => {
        const docRef = logsRef.doc();

        const power = Number(d.power) || 0;
        const voltage = Number(d.voltage) || 0;
        const current = Number(d.current) || 0;
        const runtime = Number(d.runtime) || 0;

        // 🔥 FIXED: proper kWh calculation per 10-minute interval
        // power (W) → kW → energy for 10 minutes (1/6 hour)
        const consumption = (power / 1000) * (10 / 60);

        batch.set(docRef, {
            timestamp,
            device_id: d.device_id,

            power,
            voltage,
            current,
            runtime,

            // FINAL CORRECT METRIC FOR PREDICTIONS
            consumption: Number(consumption.toFixed(6))
        });
    });

    await batch.commit();
}

module.exports = { logEnergySnapshot };