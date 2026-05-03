const express = require("express");
const router = express.Router();

// Utils / services
const { mergeDeviceData } = require("../utils/mapper");
const { computePowerTrend } = require("../utils/calculations");

// Auth middleware
const authRequired = require("../utils/auth");

// ALL DEVICES
router.get("/devices", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await mergeDeviceData(userId) || [];

        const updated = (devices || []).map(d => ({
            ...d,
            alerts: d.alerts || []
        }));

        res.json(updated);

    } catch (error) {
        console.error("Realtime devices error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// SINGLE DEVICE
router.get("/device/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        if (!deviceId || typeof deviceId !== "string" || deviceId.trim() === "") {
            return res.status(400).json({
                error: "Invalid device ID"
            });
        }

        const devices = await mergeDeviceData(userId) || [];

        const device = (devices || []).find(d => d.device_id === deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        device.alerts = device.alerts || [];

        res.json(device);

    } catch (error) {
        console.error("Single device error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POWER TREND
router.get("/power-trend/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        const devices = await mergeDeviceData(userId) || [];

        const device = (devices || []).find(d => d.device_id === deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        const trend = computePowerTrend(device.realtime_logs || []);

        res.json(trend);

    } catch (error) {
        console.error("Power trend error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// current trend
router.get("/current-trend/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        const devices = await mergeDeviceData(userId) || [];
        const device = devices.find(d => d.device_id === deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        const trend = (device.realtime_logs?.current || []).map(p => ({
            time: p.timestamp,
            value: p.value
        }));

        res.json(trend);

    } catch (error) {
        console.error("Current trend error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// voltage trend
router.get("/voltage-trend/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        const devices = await mergeDeviceData(userId) || [];
        const device = devices.find(d => d.device_id === deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        const trend = (device.realtime_logs?.voltage || []).map(p => ({
            time: p.timestamp,
            value: p.value
        }));

        res.json(trend);

    } catch (error) {
        console.error("Voltage trend error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;