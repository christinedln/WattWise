const express = require("express");
const router = express.Router();

const authRequired = require("../utils/auth");
const { db } = require("../firebase_config");
const { getDevices } = require("../services/data_service");

// GET DEVICE SETTINGS
router.post("/get", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const { deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({ error: "deviceId required" });
        }

        const devices = await getDevices(userId);

        const device = devices.find(d => d.device_id === deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        res.json(device.settings);

    } catch (err) {
        console.error("[GET SETTINGS ERROR]", err);
        res.status(500).json({ error: "Server error" });
    }
});

// UPDATE DEVICE SETTINGS
router.post("/update", authRequired, async (req, res) => {
  try {
    const userId = req.user_id;
    const { deviceId, settings } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: "deviceId required" });
    }

    if (!settings) {
      return res.status(400).json({ error: "settings required" });
    }

    const settingsRef = db
      .collection("user")
      .doc(userId)
      .collection("devices")
      .doc(deviceId)
      .collection("settings");

    const snapshot = await settingsRef.get();
    const batch = db.batch();

    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    const newDocRef = settingsRef.doc(); 
    batch.set(newDocRef, settings);

    await batch.commit();

    res.json({ success: true });

  } catch (err) {
    console.error("[UPDATE SETTINGS ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;