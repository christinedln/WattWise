const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  SECURITY: "security",
  SUPPORT: "support",
  ANALYST: "analyst",
  OPERATOR: "operator",
  USER: "user",
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: [
    "view_dashboard",
    "view_users",
    "manage_users",
    "view_devices",
    "manage_devices",
    "view_alerts",
    "manage_alerts",
    "view_reports",
    "view_security_logs",
    "manage_settings",
    "configure_mfa",
    "export_audit_logs",
  ],
  [ROLES.ADMIN]: [
    "view_dashboard",
    "view_users",
    "view_devices",
    "view_alerts",
    "view_reports",
  ],
  [ROLES.SECURITY]: [
    "view_dashboard",
    "view_alerts",
    "view_security_logs",
    "manage_alerts",
    "configure_mfa",
  ],
  [ROLES.SUPPORT]: [
    "view_dashboard",
    "view_users",
    "manage_users",
    "view_devices",
  ],
  [ROLES.ANALYST]: [
    "view_dashboard",
    "view_reports",
    "view_alerts",
  ],
  [ROLES.OPERATOR]: [
    "view_dashboard",
    "view_devices",
    "view_alerts",
    "view_reports",
    "manage_devices",
  ],
  [ROLES.USER]: ["view_dashboard"],
};

function hasPermission(role, action) {
  if (!action) {
    return true;
  }

  const normalizedRole = role || ROLES.USER;
  if (normalizedRole === ROLES.SUPERADMIN) {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(action);
}

module.exports = {
  ROLES,
  hasPermission,
};