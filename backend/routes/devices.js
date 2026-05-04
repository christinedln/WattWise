const express = require("express");
const router = express.Router();

// Services / utils
const { mergeDeviceData } = require("../utils/mapper");
const { db } = require("../firebase_config");
const admin = require("firebase-admin");

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

router.delete("/:device_id", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const deviceId = req.params.device_id;

        if (!deviceId) {
            return res.status(400).json({
                status: "error",
                message: "Invalid device ID"
            });
        }

        // USER DEVICE REF
        const userDeviceRef = db
            .collection("user")
            .doc(userId)
            .collection("devices")
            .doc(deviceId);

        const userDeviceDoc = await userDeviceRef.get();

        if (!userDeviceDoc.exists) {
            return res.status(404).json({
                status: "error",
                message: "Device not found in user collection"
            });
        }

        // GLOBAL DEVICE REF
        const globalDeviceRef = db
            .collection("devices")
            .doc(deviceId);

        const globalDeviceDoc = await globalDeviceRef.get();

        // REMOVE USER FROM OWNERS
        if (globalDeviceDoc.exists) {
            const data = globalDeviceDoc.data();
            const owners = data.owners || [];

            const updatedOwners = owners.filter(id => id !== userId);

            if (updatedOwners.length === 0) {
                // no more owners, delete global device
                await admin.firestore().recursiveDelete(globalDeviceRef);
            } else {
                // still has owners, just update array
                await globalDeviceRef.update({
                    owners: updatedOwners
                });
            }
        }

        // DELETE USER SUBCOLLECTION 
        await admin.firestore().recursiveDelete(userDeviceRef);

        return res.json({
            status: "success",
            message: "Device removed from user and cleaned globally if needed",
            device_id: deviceId
        });

    } catch (error) {
        console.error("Delete device error:", error);

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

module.exports = router;