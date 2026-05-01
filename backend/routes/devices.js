const express = require("express");
const router = express.Router();

// Services / utils
const { mergeDeviceData } = require("../utils/mapper");
const { getRate } = require("../services/data_service");
const { db } = require("../firebase_config");

// Auth middleware
const authRequired = require("../utils/auth");

router.get("/", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await mergeDeviceData(userId) || [];

        res.json({
            status: "success",
            count: devices?.length || 0,
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

router.patch("/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;
        if (!deviceId || deviceId.trim() === "") {
            return res.status(400).json({
                status: "error",
                message: "Invalid device ID"
            });
        }
        
        const { enabled, name, location } = req.body;

        if (enabled !== undefined && typeof enabled !== "boolean") {
            return res.status(400).json({
                status: "error",
                message: "enabled must be boolean"
            });
        }

        if (name !== undefined && typeof name !== "string") {
            return res.status(400).json({
                status: "error",
                message: "name must be a string"
            });
        }

        if (location !== undefined && typeof location !== "string") {
            return res.status(400).json({
                status: "error",
                message: "location must be a string"
            });
        }

        const updates = {};

        if (enabled !== undefined) updates.enabled = enabled;
        if (name !== undefined) updates.name = name.trim();
        if (location !== undefined) updates.location = location.trim();

        if (updates.name === "") {
            return res.status(400).json({
                status: "error",
                message: "Name cannot be empty"
            });
        }

        if (updates.location === "") {
            return res.status(400).json({
                status: "error",
                message: "Location cannot be empty"
            });
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                status: "error",
                message: "No valid fields to update"
            });
        }

        const docRef = db
            .collection("user")
            .doc(userId)
            .collection("devices")
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


router.get("/summary", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const devices = await mergeDeviceData(userId) || [];
        const rate = await getRate(userId) || 0;

        if (!devices.length) {
            return res.json({
                status: "success",
                data: {
                    total_devices: 0,
                    active: 0,
                    offline: 0,
                    total_kwh: 0,
                    estimated_cost: 0
                }
            });
        }

        const totalKwh = devices.reduce(
            (sum, d) => sum + (Number(d.consumption) || 0),
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