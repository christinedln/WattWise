//services/data_service
const { db } = require("../firebase_config");

// DEFAULT SETTINGS (fallback for all devices)
const DEFAULT_SETTINGS = {
  electricity_rate: 12.5,
  log_window: 10,
  current_warning_threshold:2.0,
  current_suspicious_threshold:2.5,
  current_critical_threshold:3.2,
  voltage_warning_threshold:1.5,
  voltage_suspicious_threshold:2.0,
  voltage_critical_threshold:2.6,
  power_warning_threshold:2.0,
  power_suspicious_threshold:2.5,
  power_critical_threshold:3.1,
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

async function getRealtimeLogs(userId, deviceId, logWindow) {
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
      .orderBy("timestamp", "desc")
      .limit(logWindow)
      .get();

    const logs = (snapshot.docs || []).map(doc => doc.data());

    return logs.reverse();

  } catch (error) {
    console.error("Logs fetch error:", error);
    return [];
  }
}

async function getAlerts(userId, deviceId) {
  try {
    if (!userId || !deviceId) return [];

    const alertsRef = db
      .collection("user")
      .doc(userId)
      .collection("devices")
      .doc(deviceId)
      .collection("anomalies");

    const snapshot = await alertsRef
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("Alerts fetch error:", error);
    return [];
  }
}

// Get electricity rate per device 
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
  getAlerts,
  getRealtimeLogs
};