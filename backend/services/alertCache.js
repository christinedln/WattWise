const alertByPath = new Map();

function normalizeSeverity(value) {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) {
    return "Unknown";
  }

  if (raw === "critical") return "Critical";
  if (raw === "suspicious") return "Suspicious";
  if (raw === "warning") return "Warning";
  if (raw === "info") return "Info";

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function parseTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(String(value).trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const parsed = new Date(String(value).trim());
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function buildAlert(docRef, data = {}) {
  const pathParts = docRef.path.split("/");
  const userId = pathParts[1] || null;
  const deviceId = pathParts[3] || null;
  const contextLogs = Array.isArray(data.context_logs) ? data.context_logs : [];
  const latestContext = contextLogs.length > 0 ? contextLogs[contextLogs.length - 1] : {};

  return {
    id: docRef.id,
    path: docRef.path,
    user_id: userId,
    user_name: userId || "Unknown user",
    user_email: null,
    device_id: deviceId,
    device_name: deviceId || "Unknown device",
    signal: data.signal || "unknown",
    severity: normalizeSeverity(data.severity),
    severity_raw: data.severity || null,
    resolved: Boolean(data.resolved),
    emailSent: Boolean(data.emailSent),
    timestamp: parseTimestamp(data.timestamp),
    context_logs: contextLogs,
    latest: {
      current: latestContext.current ?? null,
      voltage: latestContext.voltage ?? null,
      power: latestContext.power ?? null,
    },
    _sortKey: toMillis(data.timestamp),
  };
}

function upsertAlert(docRef, data) {
  const alert = buildAlert(docRef, data);
  alertByPath.set(alert.path, alert);
  return alert;
}

function removeAlert(docRef) {
  alertByPath.delete(docRef.path);
}

function getAlerts() {
  return Array.from(alertByPath.values())
    .map((alert) => ({ ...alert }))
    .sort((left, right) => right._sortKey - left._sortKey)
    .map(({ _sortKey, ...alert }) => alert);
}

function clearAlerts() {
  alertByPath.clear();
}

module.exports = {
  buildAlert,
  clearAlerts,
  getAlerts,
  removeAlert,
  upsertAlert,
};