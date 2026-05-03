const express = require("express");
const router = express.Router();

const { mapRealtimePage } = require("../utils/realtime_mapper");

// auth
const authRequired = require("../utils/auth");

// ALL DEVICES (REALTIME PAGE)
router.get("/devices", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await mapRealtimePage(userId) || [];

        const updated = devices.map(d => ({
            ...d,
            alerts: d.currentalert || []
        }));

        console.log("time:", new Date().toISOString());

        res.json(updated);

    } catch (error) {
        console.error("Realtime devices error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POWER TREND 
router.get("/power-trend/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        const devices = await mapRealtimePage(userId) || [];

        const device = devices.find(d => d.device_id === deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        const trend = (device.realtimelogs || []).map(p => ({
            time: p.timestamp,
            value: p.power
        }));

        res.json(trend);
    } catch (error) {
        console.error("Power trend error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// CURRENT TREND
router.get("/current-trend/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        const devices = await mapRealtimePage(userId) || [];
        const device = devices.find(d => d.device_id === deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        const trend = (device.realtimelogs || []).map(p => ({
            time: p.timestamp,
            value: p.current
        }));

        res.json(trend);

    } catch (error) {
        console.error("Current trend error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// VOLTAGE TREND
router.get("/voltage-trend/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        const devices = await mapRealtimePage(userId) || [];
        const device = devices.find(d => d.device_id === deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        const trend = (device.realtimelogs || []).map(p => ({
            time: p.timestamp,
            value: p.voltage
        }));

        res.json(trend);

    } catch (error) {
        console.error("Voltage trend error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;