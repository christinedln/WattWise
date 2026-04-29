const express = require("express");
const router = express.Router();

// Services / utils
const { mergeDeviceData } = require("../utils/mapper");
const { getRate } = require("../services/data_service");
const { db } = require("../firebase_config");

// Auth middleware
const authRequired = require("../utils/auth");


// ===============================
// GET ALL DEVICES (REAL-TIME READ ONLY)
// ===============================
router.get("/", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await mergeDeviceData(userId);

        res.json({
            status: "success",
            count: devices.length,
            data: devices
        });

    } catch (error) {
        console.error("Get devices error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
});


// ===============================
// GET DEVICES BY USER (redundant but kept for frontend compatibility)
// ===============================
router.get("/devices", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await mergeDeviceData(userId);

        res.json({
            status: "success",
            count: devices.length,
            data: devices
        });

    } catch (error) {
        console.error("Get user devices error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
});


// ===============================
// UPDATE DEVICE (PATCH)
// Only allows: name, location, enabled
// ===============================
router.patch("/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        const { enabled, name, location } = req.body;

        const updates = {};

        if (enabled !== undefined) updates.enabled = enabled;
        if (name !== undefined) updates.name = name;
        if (location !== undefined) updates.location = location;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                status: "error",
                message: "No valid fields to update"
            });
        }

        const docRef = db
            .collection("devices")
            .doc(userId)
            .collection("user_devices")
            .doc(deviceId);

        await docRef.update(updates);

        res.json({
            status: "success",
            device_id: deviceId,
            updated: updates
        });

    } catch (error) {
        console.error("Update device error:", error);

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});


// ===============================
// DEVICE SUMMARY
// ===============================
router.get("/summary", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await mergeDeviceData(userId);
        const rate = await getRate(userId);

        const totalKwh = devices.reduce(
            (sum, d) => sum + (d.consumption || 0),
            0
        );

        const totalCost = Number((totalKwh * rate).toFixed(2));

        const active = devices.filter(d => d.status === "active").length;
        const offline = devices.filter(d => d.status === "offline").length;

        res.json({
            status: "success",
            data: {
                total_devices: devices.length,
                active,
                offline,
                total_kwh: Number(totalKwh.toFixed(2)),
                estimated_cost: totalCost
            }
        });

    } catch (error) {
        console.error("Device summary error:", error);

        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
    
});

module.exports = router;