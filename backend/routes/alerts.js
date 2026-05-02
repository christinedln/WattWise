const express = require("express");
const router = express.Router();

const authRequired = require("../utils/auth");

// GET ALERTS (from anomalies collection)
router.get("/", authRequired, async (req, res) => {
  try {
    const userId = req.user_id;
    const dbModule = await import("../firebase_config.js");
    const db = dbModule.db;

    const snapshot = await db
      .collection("user")
      .doc(userId)
      .collection("devices")
      .get();

    const alerts = [];

    for (const deviceDoc of snapshot.docs) {
      const deviceId = deviceDoc.id;
      const deviceData = deviceDoc.data();

      const anomaliesSnap = await db
        .collection("user")
        .doc(userId)
        .collection("devices")
        .doc(deviceId)
        .collection("anomalies")
        .orderBy("timestamp", "desc")
        .limit(20)
        .get();

      anomaliesSnap.forEach((doc) => {
        const data = doc.data();

        //get latest context log safely
        const logs = data.context_logs || [];
        const latest = logs.length > 0 ? logs[logs.length - 1] : {};

        alerts.push({
          id: doc.id,
          device_id: deviceId,
          device_name: deviceData.name || "Unknown Device",
          signal: data.signal,
          severity: data.severity,
          resolved: data.resolved,
          emailSent: data.emailSent,
          timestamp: data.timestamp,

          voltage: latest.voltage ?? null,
          current: latest.current ?? null,
          power: latest.power ?? null,
        });
      });
    }

    // sort latest first
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(alerts);

  } catch (error) {
    console.error("❌ Alerts error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;