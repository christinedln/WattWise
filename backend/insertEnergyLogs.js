const { db } = require("./firebase_config.js");

const userId = "T6kSTXn5Z3diE0AUDG6xoMevVf83";
const deviceId = "5C4F00AB61C5";

// ===============================
// BASE VALUES (for simulation only)
// ===============================
const base = {
  consumption: 0.0565,
  current: 0.25,
  power: 56.5,
  voltage: 226.8
};

// ===============================
// SMALL VARIATION FUNCTION
// ===============================
function vary(value, percent = 0.08) {
  const change = (Math.random() * 2 - 1) * percent;
  return value + value * change;
}

// ===============================
// CLEAR EXISTING LOGS
// ===============================
async function clearLogs() {
  const ref = db
    .collection("user")
    .doc(userId)
    .collection("devices")
    .doc(deviceId)
    .collection("energy_logs");

  const snapshot = await ref.get();

  if (snapshot.empty) {
    console.log("No logs to delete.");
    return;
  }

  let batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    count++;

    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }

  await batch.commit();

  console.log(`Deleted ${count} logs`);
}

// ===============================
// GENERATE 10-MIN TIMESTAMPS
// ===============================
function generateTimestamps(startDate, days) {
  const timestamps = [];

  for (let d = 0; d < days; d++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(dayStart.getDate() + d);

    for (let i = 0; i < 144; i++) {
      const date = new Date(dayStart);

      const minutes = i * 10;

      date.setHours(Math.floor(minutes / 60));
      date.setMinutes(minutes % 60);
      date.setSeconds(Math.floor(Math.random() * 60));

      timestamps.push(date.toISOString());
    }
  }

  return timestamps;
}

// ===============================
// SEED ENERGY LOGS (CORRECTED)
// ===============================
async function seedLogs() {
  const ref = db
    .collection("user")
    .doc(userId)
    .collection("devices")
    .doc(deviceId)
    .collection("energy_logs");

  const timestamps = generateTimestamps(
    new Date("2026-04-24T00:00:00Z"),
    7
  );

  console.log("Expected logs:", timestamps.length); // 1008

  let batch = db.batch();
  let count = 0;

  for (const ts of timestamps) {
    const docRef = ref.doc();

    const consumption = vary(base.consumption, 0.1);
    const power = vary(base.power, 0.1);
    const current = vary(base.current, 0.1);
    const voltage = vary(base.voltage, 0.02);

    batch.set(docRef, {
      device_id: deviceId,
      timestamp: ts,

      // ===============================
      // ENERGY TRUTH (USED IN ANALYTICS)
      // ===============================
      consumption: Number(consumption.toFixed(4)),

      // ===============================
      // SENSOR VALUES (FOR UI ONLY)
      // ===============================
      current: Number(current.toFixed(3)),
      power: Number(power.toFixed(2)),
      voltage: Number(voltage.toFixed(2)),

      // ===============================
      // FIXED INTERVAL (10 MINUTES)
      // ===============================
      runtime: 600
    });

    count++;

    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }

  await batch.commit();

  console.log("SEED COMPLETE");
  console.log("Logs inserted:", count);
}

// ===============================
async function run() {
  console.log("Starting cleanup...");
  await clearLogs();

  console.log("Seeding new logs...");
  await seedLogs();

  console.log("DONE");
}

run().catch(console.error);