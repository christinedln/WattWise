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
        const logs = (data.context_logs || []).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        const latest = logs.length > 0 ? logs[0] : {};

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

          context_logs: logs
        });
      });
    }

    // sort latest first
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(alerts);

  } catch (error) {
    console.error("Alerts error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id/resolve", authRequired, async (req, res) => {
  try {
    const userId = req.user_id;
    const alertId = req.params.id;
    const { resolved } = req.body;

    const dbModule = await import("../firebase_config.js");
    const db = dbModule.db;

    const devicesSnap = await db
      .collection("user")
      .doc(userId)
      .collection("devices")
      .get();

    let found = false;

    for (const deviceDoc of devicesSnap.docs) {
      const ref = db
        .collection("user")
        .doc(userId)
        .collection("devices")
        .doc(deviceDoc.id)
        .collection("anomalies")
        .doc(alertId);

      const doc = await ref.get();

      if (doc.exists) {
        await ref.update({
          resolved: resolved ?? true,
        });

        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Resolve toggle error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;