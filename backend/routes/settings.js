const express = require("express");
const router = express.Router();

// Services
const { getUserSettings, updateUserSettings } = require("../services/settings_service");

// Auth middleware
const authRequired = require("../utils/auth");


// ===============================
// GET SETTINGS
// ===============================
router.get("/", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;

        const settings = await getUserSettings(userId);

        res.json(settings);

    } catch (error) {
        console.error("Fetch settings error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// ===============================
// UPDATE SETTINGS
// ===============================
router.post("/", authRequired, async (req, res) => {
    try {
        const userId = req.user_id;
        const data = req.body;

        const updated = await updateUserSettings(userId, data);

        res.json(updated);

    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;