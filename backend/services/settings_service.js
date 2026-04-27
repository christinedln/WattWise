const { db } = require("../firebase_config");

// DEFAULT SETTINGS (same as Python dict)
const DEFAULT_SETTINGS = {
    electricity_rate: 12.5,
    polling_interval: 5,
    energy_alert_threshold: 5000,
    security_alert_level: 3
};


// ===============================
// GET USER SETTINGS
// ===============================
async function getUserSettings(userId) {
    try {
        const doc = await db
            .collection("settings")
            .doc(userId)
            .get();

        if (!doc.exists) {
            // fallback to defaults
            return DEFAULT_SETTINGS;
        }

        const data = doc.data() || {};

        // merge defaults + DB values (same as Python {**a, **b})
        return {
            ...DEFAULT_SETTINGS,
            ...data
        };

    } catch (error) {
        console.error("Settings fetch error:", error);

        // fallback to defaults
        return DEFAULT_SETTINGS;
    }
}


// ===============================
// UPDATE USER SETTINGS
// ===============================
async function updateUserSettings(userId, data) {
    try {
        await db
            .collection("settings")
            .doc(userId)
            .set(data, { merge: true });

        return true;

    } catch (error) {
        console.error("Settings update error:", error);
        return false;
    }
}


// EXPORTS
module.exports = {
    getUserSettings,
    updateUserSettings
};