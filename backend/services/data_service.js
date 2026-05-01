//services/data_service
const { db } = require("../firebase_config");

// DEFAULT SETTINGS (fallback for all devices)
const DEFAULT_SETTINGS = {
  electricity_rate: 12.5,
  polling_interval: 5,
  energy_alert_threshold: 5000,
  security_alert_level: 3
};

// Get Devices (with latest + settings)
async function getDevices(userId) {
  try {
    const devicesRef = db
      .collection("user")
      .doc(userId)
      .collection("devices");

    const snapshot = await devicesRef.get();

    const devices = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      let enabled = data.enabled ?? true;

      if (typeof enabled === "string") {
        enabled = enabled.toLowerCase() === "true";
      }

      // Get latest data
      let latestData = {};
      const latestSnap = await doc.ref.collection("latest").limit(1).get();

      if (!latestSnap.empty) {
        latestData = latestSnap.docs[0].data();
      }

      // Get settings
      let settingsData = {};
      const settingsSnap = await doc.ref.collection("settings").limit(1).get();

      if (!settingsSnap.empty) {
        settingsData = settingsSnap.docs[0].data();
      }

      // MERGE DEFAULT + DEVICE SETTINGS (ONLY HERE)
      const finalSettings = {
        ...DEFAULT_SETTINGS,
        ...(settingsData || {})
      };

      devices.push({
        device_id: doc.id,
        name: data.name || "Unnamed Device",
        location: data.location || "Unknown",
        enabled,
        status: data.status,

        // latest sensor values
        ...latestData,

        // normalized settings
        settings: finalSettings
      });
    }

    return devices;

  } catch (error) {
    console.error("Devices fetch error:", error);
    return [];
  }
}

async function getRealtimeLogs(userId, deviceId, limit = 10) {
  try {

    if (!userId || !deviceId) {
      console.warn("Invalid params:", { userId, deviceId });
      return [];
    }

    const logsRef = db
      .collection("user")
      .doc(userId)
      .collection("devices")
      .doc(deviceId)
      .collection("realtime_logs");

    const snapshot = await logsRef
      .orderBy("Timestamp", "desc")
      .limit(limit)
      .get();

    const logs = (snapshot.docs || []).map(doc => doc.data());

    return logs.reverse();

  } catch (error) {
    console.error("Logs fetch error:", error);
    return [];
  }
}

// Get electricity rate per device (FIXED: uses mapper now)
async function getRate(userId, deviceId) {
  try {
    const devices = await getDevices(userId);
    const device = (devices || []).find(
      d => d.device_id === (deviceId || "").trim()
    );

    const rate = device?.settings?.electricity_rate;

    return rate ?? DEFAULT_SETTINGS.electricity_rate;

  } catch (error) {
    console.error("Rate fetch error:", error);
    return DEFAULT_SETTINGS.electricity_rate;
  }
}

module.exports = {
  getDevices,
  getRate,
  getRealtimeLogs
};