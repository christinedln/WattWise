const { getDevices, getRealtimeLogs, getCurrentAlerts } = require("../services/data_service");

async function mapRealtimePage(userId) {
  try {
    const devices = await getDevices(userId);

    const mapped = [];

    for (const d of devices) {
      const deviceId = d.device_id;

      const runtime = d.runtime || d.uptime || 0;

      const realtimelogs = await getRealtimeLogs(
        userId,
        deviceId,
        d.settings?.log_window || 10
      );

      let currentAlerts = await getCurrentAlerts(userId, deviceId);

      currentAlerts = (currentAlerts || []).map(a => ({
        id: a.id,
        signal: a.signal, 
        severity: (a.severity || "normal").toLowerCase(),
        timestamp: a.timestamp || null,
      }));

      mapped.push({
        device_id: deviceId,

        name: d.name,
        location: d.location,
        status: d.status,

        voltage: d.voltage ?? 0,
        current: d.current ?? 0,
        power: d.power ?? 0,
        lastUpdated: d.lastUpdated || null,

        runtime,

        realtimelogs,

        // renamed for clarity
        currentAlerts,
      });
    }

    return mapped;

  } catch (error) {
    console.error("Realtime mapper error:", error);
    return [];
  }
}

module.exports = {
  mapRealtimePage,
};