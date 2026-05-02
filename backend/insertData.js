// insertData.js

import admin from "firebase-admin";
import { db } from "./firebase_config.js"; // make sure .js is included

async function insertAll() {
  try {
    const userId = "T6kSTXn5Z3diE0AUDG6xoMevVf83";
    const deviceId = "8C4F00AB61C4";

    // 1. device
    await db.doc(`user/${userId}/devices/${deviceId}`).set({
      device_id: "8C4F00AB61C4",
      name: "Fan ni Liza",
      location: "Salas",
      enabled: true,
      status: "ON",
    });

    // 2. latest
    await db.doc(`user/${userId}/devices/${deviceId}/latest/current`).set({
      lastUpdated: "2026-05-01T20:11:24.388Z",
      power: 250,
      voltage: 34.5,
      current: 0.22,
      runtime: 2560,
    });

    // 3. global device
    await db.doc(`devices/${deviceId}`).set({
      owners: admin.firestore.FieldValue.arrayUnion(userId),
    }, { merge: true });

    // 4. realtime log
    await db.collection(`user/${userId}/devices/${deviceId}/realtime_logs`).add({
      timestamp: "2026-04-29T14:11:43.204Z",
      power: 45.6,
      current: 0.25,
      voltage: 45.8,
      runtime: 2560,
      device_id: "8C4F00AB61C4",
    });

    // 5. anomaly
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

    // 6. anomaly state
    await db.doc(`user/${userId}/devices/${deviceId}/anomaly_state/current`).set({
      severity: "warning",
      signal: "current",
      timestamp: "2026-05-01T15:14:46.125Z",
    });

    console.log("All data inserted");
  } catch (err) {
    console.error("Error:", err);
  }
}

insertAll();