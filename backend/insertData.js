import admin from "firebase-admin";
import { db } from "./firebase_config.js"; 

async function insertAll() {
  try {
    const userId = "IaMyl82XHgT7DxAiMv3L95sWU5v1";
    const deviceId = "8C4F00AB61C4";

    // device
    await db.doc(`user/${userId}/devices/${deviceId}`).set({
      device_id: "8C4F00AB61C4",
      name: "Fan ni Phem",
      location: "Salas",
      enabled: true,
      status: "OFF",
    });

    // latest
    await db.doc(`user/${userId}/devices/${deviceId}/latest/current`).set({
      lastUpdated: "2026-05-01T20:11:24.388Z",
      power: 253,
      voltage: 36.5,
      current: 0.26,
      runtime: 2540,
    });

    // global device
    await db.doc(`devices/${deviceId}`).set({
      owners: admin.firestore.FieldValue.arrayUnion(userId),
    }, { merge: true });

    // realtime log
    await db.collection(`user/${userId}/devices/${deviceId}/realtime_logs`).add({
      timestamp: "2026-04-29T14:11:43.204Z",
      power: 45.8,
      current: 0.45,
      voltage: 45.9,
      runtime: 2530,
      device_id: "8C4F00AB61C4",
    });

    // anomaly
    await db.collection(`user/${userId}/devices/${deviceId}/anomalies`).add({
      timestamp: "2026-05-01T14:44:46.125Z",
      severity: "critical",
      signal: "current",
      resolved: false,
      emailSent: false,
      context_logs: [
        {
          power: 245,
          timestamp: "2026-05-01T14:44:46.125Z",
          voltage: 34.7,
          current: 0.45,
        }
      ],
    });

    // anomaly state
    await db.doc(`user/${userId}/devices/${deviceId}/anomaly_state/current`).set({
      severity: "warning",
      signal: "current",
      timestamp: "2026-05-01T15:14:46.125Z",
    });

    await db.doc(`user/${userId}/devices/${deviceId}/anomaly_state/power`).set({
      severity: "warning",
      signal: "power",
      timestamp: "2026-05-01T15:14:46.125Z",
    });

    await db.doc(`user/${userId}/devices/${deviceId}/anomaly_state/voltage`).set({
      severity: "warning",
      signal: "voltage",
      timestamp: "2026-05-01T15:14:46.125Z",
    });

    console.log("All data inserted");
  } catch (err) {
    console.error("Error:", err);
  }
}

insertAll();