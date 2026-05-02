import { db } from "./firebase_config.js";

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function pickSeverity(value, t) {
  if (value >= t.critical) return "critical";
  if (value >= t.suspicious) return "suspicious";
  if (value >= t.warning) return "warning";
  return null;
}

function generateAnomaly() {
  const signals = ["current", "voltage", "power"];
  const signal = signals[Math.floor(Math.random() * signals.length)];

  let value, thresholds;

  if (signal === "current") {
    value = round1(getRandom(1.5, 4.8));
    thresholds = { warning: 2.0, suspicious: 2.5, critical: 3.5 };
  } else if (signal === "voltage") {
    value = round1(getRandom(15, 45));
    thresholds = { warning: 38, suspicious: 40, critical: 42 };
  } else {
    value = round1(getRandom(150, 950));
    thresholds = { warning: 400, suspicious: 600, critical: 800 };
  }

  const severity = pickSeverity(value, thresholds);

  if (!severity) return generateAnomaly();

  const now = new Date();
  const prev = new Date(now.getTime() - 30000);

  return {
    timestamp: now.toISOString(),
    severity,
    signal,
    resolved: Math.random() > 0.7,
    emailSent: Math.random() > 0.5,

    context_logs: [
      {
        power: round1(getRandom(100, 900)),
        voltage: round1(getRandom(20, 45)),
        current: round1(getRandom(0.5, 4.5)),
        timestamp: now.toISOString(),
      },
      {
        power: round1(getRandom(100, 900)),
        voltage: round1(getRandom(20, 45)),
        current: round1(getRandom(0.5, 4.5)),
        timestamp: prev.toISOString(),
      },
    ],
  };
}

async function insertRandomAnomalies(userId, deviceId, count = 6) {
  try {
    for (let i = 0; i < count; i++) {
      const anomaly = generateAnomaly();

      await db
        .collection(`user/${userId}/devices/${deviceId}/anomalies`)
        .add(anomaly);

      console.log(`Inserted anomaly ${i + 1}`);
    }

    console.log("Done inserting anomalies");
  } catch (err) {
    console.error("Error inserting anomalies:", err);
  }
}

const userId = "T6kSTXn5Z3diE0AUDG6xoMevVf83";
const deviceId = "8C4F00AB61C4";

// 3 logs
insertRandomAnomalies(userId, deviceId, 3);