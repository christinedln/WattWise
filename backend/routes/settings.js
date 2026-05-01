const express = require("express");
const router = express.Router();

const authRequired = require("../utils/auth");
const { db } = require("../firebase_config");

// UPDATE DEVICE SETTINGS
router.post("/update", authRequired, async (req, res) => {
  try {
    const userId = req.user_id;
    const { deviceId, settings } = req.body;

    if (!deviceId?.trim()) {
      return res.status(400).json({ error: "Invalid deviceId" });
    }

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Invalid settings object" });
    }

    const settingsRef = db
      .collection("user")
      .doc(userId)
      .collection("devices")
      .doc(deviceId)
      .collection("settings");

    const snapshot = await settingsRef.get();
    const batch = db.batch();

    snapshot.forEach(doc => batch.delete(doc.ref));

    batch.set(settingsRef.doc(), {
      ...settings,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();

    res.json({ success: true });

  } catch (err) {
    console.error("[UPDATE SETTINGS ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;