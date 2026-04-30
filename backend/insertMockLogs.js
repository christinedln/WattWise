import { db } from "./firebase_config.js";

const userId = "dNJypjj5iRaN77MUR3dLwE1YRS42";
const deviceId = "8C4F00AB61C4";

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

    let power;
    let current;
    let voltage;

    if (i < 5) {
      power = 45 + Math.random() * 2;
      current = 0.24 + Math.random() * 0.03;
      voltage = 219 + Math.random() * 2;
    }

    else if (i >= 5 && i <= 6) {
      power = 70 + Math.random() * 5;       // spike
      current = 0.4 + Math.random() * 0.05; // spike
      voltage = 235 + Math.random() * 5;    // spike
    }

    else {
      power = 46 + Math.random() * 2;
      current = 0.25 + Math.random() * 0.03;
      voltage = 219 + Math.random() * 2;
    }

    const docRef = logsRef.doc();

    batch.set(docRef, {
      Timestamp: timestamp.toISOString(),
      Power: +power.toFixed(2),
      Current: +current.toFixed(3),
      Voltage: +voltage.toFixed(2),
      runtime: 2500 + i * 5,
      Status: "ON",
      Device_id: deviceId
    });
  }

  await batch.commit();
  console.log("10 mock logs inserted with anomalies");
}

insertMockLogs().catch(console.error);