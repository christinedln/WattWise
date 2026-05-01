import { db } from "./firebase_config.js";

const userId = "dNJypjj5iRaN77MUR3dLwE1YRS42";
const deviceId = "7D4F00CD61C3";

async function insertMockLogs() {
  const logsRef = db
    .collection("user")
    .doc(userId)
    .collection("devices")
    .doc(deviceId)
    .collection("realtime_logs");

  const baseTime = new Date();
  const batch = db.batch();

  for (let i = 0; i < 10; i++) {
    const timestamp = new Date(baseTime.getTime() - (9 - i) * 5000);

    let power, current, voltage;

    //  BASELINE (first 9 logs)
    if (i < 9) {
      power = 45 + Math.random() * 0.2;       // very tight variance
      current = 0.25 + Math.random() * 0.002;
      voltage = 220 + Math.random() * 0.2;
    }

    //  FINAL LOG = STRONG ANOMALY
    else {
      power = 120 + Math.random() * 5;   // HUGE spike
      current = 1.2 + Math.random() * 0.1;
      voltage = 260 + Math.random() * 3;
    }

    const docRef = logsRef.doc();

    batch.set(docRef, {
      timestamp: timestamp.toISOString(),
      power: +power.toFixed(2),
      current: +current.toFixed(3),
      voltage: +voltage.toFixed(2),
      runtime: 3000 + i * 5,
      device_id: deviceId
    });
  }

  await batch.commit();
  console.log("10 logs inserted (last log = CRITICAL anomaly for all metrics)");
}

insertMockLogs().catch(console.error);