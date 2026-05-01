//routes/alerts
const express = require("express");
const router = express.Router();

const { mergeDeviceData } = require("../utils/mapper");

// Auth
const authRequired = require("../utils/auth");

// GET ALERTS
router.get("/", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await mergeDeviceData(userId) || [];

        if (!devices.length) {
            return res.json([]);
        }

        // extract only alerts
        const alerts = [];

        for (const d of devices || []) {
            for (const a of d.alerts || []) {
                alerts.push({
                    device_id: d.device_id,
                    device_name: d.name,
                    signal: a.signal,
                    severity: a.severity,
                    message: a.message
                });
            }
        }

        res.json(alerts);

    } catch (error) {
        console.error("Alerts error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;