const express = require("express");
const router = express.Router();

// Services (same role as Flask imports)
const { getDevices } = require("../services/data_service");
const { getUserSettings } = require("../services/settings_service");

// Utils
const { generateAlerts } = require("../utils/alerts");
const authRequired = require("../utils/auth");

// GET ALERTS
router.get("/", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await getDevices(userId);
        const settings = await getUserSettings(userId);

        const alerts = generateAlerts(devices, settings);

        res.json(alerts);

    } catch (error) {
        console.error("Alerts error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;