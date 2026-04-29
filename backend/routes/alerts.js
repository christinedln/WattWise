const express = require("express");
const router = express.Router();

// Services
const { getDevices } = require("../services/data_service");

// Utils
const { generateAlerts } = require("../utils/alerts");
const authRequired = require("../utils/auth");

// GET ALERTS
router.get("/", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await getDevices(userId);

        const alerts = generateAlerts(devices);

        res.json(alerts);

    } catch (error) {
        console.error("Alerts error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;