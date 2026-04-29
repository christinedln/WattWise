const { db } = require("../firebase_config");

const userId = "4NOeOlPtY5S5NSxQ4mMMY9RUhQx2";
const deviceId = "8C4F00AB61C4";

// base realistic values
const base = {
    consumption: 0.0565,
    current: 0.25,
    power: 56.5,
    runtime: 11441,
    voltage: 226.8
};

// helper: small realistic variation
function vary(value, percent = 0.08) {
    const change = (Math.random() * 2 - 1) * percent;
    return value + value * change;
}

// ===============================
// 🔥 DELETE ALL EXISTING LOGS
// ===============================
async function clearLogs() {
    const logsRef = db
        .collection("energy_logs")
        .doc(userId)
        .collection("logs");

    const snapshot = await logsRef.get();

    if (snapshot.empty) {
        console.log("🟡 No logs to delete.");
        return;
    }

    let batch = db.batch();
    let count = 0;

    for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        count++;

        // Firestore batch limit safety
        if (count % 400 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }

    await batch.commit();

    console.log(`🧹 Deleted ${count} existing logs`);
}

// ===============================
// ⏱ GENERATE 10-MIN INTERVAL DATA
// ===============================
function generateTimestamps(startDate, days) {
    const timestamps = [];

    for (let d = 0; d < days; d++) {
        const dayStart = new Date(startDate);
        dayStart.setDate(dayStart.getDate() + d);

        // 24 hours × 6 logs/hour = 144 logs/day
        for (let i = 0; i < 144; i++) {
            const date = new Date(dayStart);
            date.setMinutes(i * 10);
            date.setSeconds(Math.floor(Math.random() * 60));

            timestamps.push(date.toISOString());
        }
    }

    return timestamps;
}

// ===============================
// 🌱 SEED NEW LOGS
// ===============================
async function seedLogs() {
    const logsRef = db
        .collection("energy_logs")
        .doc(userId)
        .collection("logs");

    const timestamps = generateTimestamps(
        new Date("2026-04-23T00:00:00Z"),
        7 // ✅ 7 days
    );

    let batch = db.batch();
    let count = 0;

    for (const ts of timestamps) {
        const docRef = logsRef.doc();

        const consumption = vary(base.consumption, 0.1);
        const power = vary(base.power, 0.1);
        const current = vary(base.current, 0.1);
        const voltage = vary(base.voltage, 0.02);

        batch.set(docRef, {
            device_id: deviceId,
            timestamp: ts,

            consumption: Number(consumption.toFixed(4)),
            current: Number(current.toFixed(3)),
            power: Number(power.toFixed(2)),
            runtime: base.runtime,
            voltage: Number(voltage.toFixed(2))
        });

        count++;

        if (count % 400 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }

    await batch.commit();

    console.log("✅ SEED COMPLETE");
    console.log("📊 Logs inserted:", count);
}

// ===============================
// 🚀 RUN EVERYTHING
// ===============================
async function run() {
    console.log("Starting cleanup...");
    await clearLogs(); // 🔥 STEP 1: DELETE

    console.log("Seeding new logs...");
    await seedLogs(); // 🌱 STEP 2: INSERT

    console.log("🎉 DONE");
}

run().catch(console.error);