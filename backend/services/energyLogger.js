const { db } = require("../firebase_config");

// in-memory throttle tracker
const lastLogTime = new Map();


function shouldLog(userId, intervalMs = 10 * 60 * 1000) {
    const now = Date.now();
    const last = lastLogTime.get(userId);

    if (!last || now - last >= intervalMs) {
        lastLogTime.set(userId, now);
        return true;
    }

    return false;
}


async function logEnergySnapshot(userId, devices) {
    // 10-minute throttle per user
    if (!shouldLog(userId)) return;

    if (!devices || devices.length === 0) return;

    const logsRef = db
        .collection("energy_logs")
        .doc(userId)
        .collection("logs");

    const batch = db.batch();

    const timestamp = new Date().toISOString();

    devices.forEach((d) => {
        const docRef = logsRef.doc();

        const power = Number(d.power) || 0;
        const voltage = Number(d.voltage) || 0;
        const current = Number(d.current) || 0;
        const runtime = Number(d.runtime) || 0;

        //since runtime is in seconds
        const hours = runtime / 3600;
        const consumption = (power / 1000) * hours;

        batch.set(docRef, {
            timestamp,
            device_id: d.device_id,

            power,
            voltage,
            current,
            runtime,

            consumption: Number(consumption.toFixed(6))
        });
    });

    await batch.commit();
}

module.exports = { logEnergySnapshot };