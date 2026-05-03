const express = require("express");

const router = express.Router();

const authRequired = require("../utils/auth");
const { getAlerts } = require("../services/alertCache");
const { hasPermission } = require("../utils/permissions");

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

function formatTimestamp(value) {
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

  const parsed = new Date(String(value).trim());
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

router.get("/", authRequired, async (req, res) => {
  try {
    if (!hasPermission(req.user?.role, "view_alerts") && !hasPermission(req.user?.role, "view_reports")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const alerts = getAlerts();

    const summary = alerts.reduce(
      (acc, alert) => {
        acc.totalAlerts += 1;
        if (!alert.resolved) {
          acc.unresolvedAlerts += 1;
        }
        if (alert.severity === "Critical") {
          acc.criticalAlerts += 1;
        }
        if (alert.emailSent) {
          acc.emailedAlerts += 1;
        }
        acc.userIds.add(alert.user_id || "unknown");
        acc.deviceIds.add(alert.device_id || "unknown");
        return acc;
      },
      {
        totalAlerts: 0,
        unresolvedAlerts: 0,
        criticalAlerts: 0,
        emailedAlerts: 0,
        userIds: new Set(),
        deviceIds: new Set(),
      }
    );

    const alertCountsByUser = new Map();

    alerts.forEach((alert) => {
      const key = alert.user_id || "unknown";
      const current = alertCountsByUser.get(key) || {
        user_id: key,
        user_name: alert.user_name,
        user_email: alert.user_email,
        total: 0,
        critical: 0,
        unresolved: 0,
      };

      current.total += 1;
      if (alert.severity === "Critical") {
        current.critical += 1;
      }
      if (!alert.resolved) {
        current.unresolved += 1;
      }

      alertCountsByUser.set(key, current);
    });

    const topUsers = Array.from(alertCountsByUser.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    res.json({
      summary: {
        totalAlerts: summary.totalAlerts,
        unresolvedAlerts: summary.unresolvedAlerts,
        criticalAlerts: summary.criticalAlerts,
        emailedAlerts: summary.emailedAlerts,
        usersAffected: summary.userIds.size,
        devicesAffected: summary.deviceIds.size,
      },
      alerts,
      topUsers,
    });
  } catch (error) {
    console.error("Superadmin alerts error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id/resolve", authRequired, async (req, res) => {
  try {
    if (!hasPermission(req.user?.role, "manage_alerts")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.status(409).json({
      error: "Alert updates are temporarily unavailable while the cache-only read path is active.",
    });

  } catch (error) {
    console.error("Resolve alert error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;